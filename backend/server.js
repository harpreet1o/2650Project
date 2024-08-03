import express from "express";
import { Server } from "socket.io";
import { createServer } from "http";
import cors from "cors";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import { Chess } from "chess.js";
import { createClient } from "redis";
import sql from 'mssql';
import config from './config.js';
import sqlite3 from 'sqlite3';
import authRoutes from './routes/auth.js';
import { saveGameResult } from "./models/games.js";

const secretKeyJWT = "harganga";
const port = 3000;

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const redisClient = createClient();

redisClient.on("error", (error) => console.error(`Error: ${error}`));

(async () => {
  await redisClient.connect();
  console.log('Redis client connected successfully.');
})();

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use('/', authRoutes);

const gameTimers = {};
const lobbies = {
  1: [], // 1 minute lobby
  5: [], // 5 minutes lobby
  10: [] // 10 minutes lobby
};

const startTimer = (roomIndex, selectedTime) => {
  if (!gameTimers[roomIndex]) {
    const room = lobbies[selectedTime].find(room => room.roomIndex === roomIndex);
    gameTimers[roomIndex] = {
      whiteTime: room.time * 60, // Convert minutes to seconds
      blackTime: room.time * 60,
      currentPlayer: "w",
      intervalId: setInterval(() => updateTimer(roomIndex), 1000),
    };
  }
};

const updateTimer = (roomIndex) => {
  const timer = gameTimers[roomIndex];
  if (timer.currentPlayer === "w") {
    timer.whiteTime--;
    if (timer.whiteTime <= 0) {
      endGame(roomIndex, "black", "Time out");
    }
  } else {
    timer.blackTime--;
    if (timer.blackTime <= 0) {
      endGame(roomIndex, "white", "Time out");
    }
  }
  io.to(roomIndex.toString()).emit("timerUpdate", {
    whiteTime: timer.whiteTime,
    blackTime: timer.blackTime,
  });
};

const endGame = (roomIndex, winner, reason) => {
  clearInterval(gameTimers[roomIndex].intervalId);
  io.to(roomIndex.toString()).emit("gameOver", reason);
  // Handle game over logic and save results
  delete gameTimers[roomIndex];
};

// Function to get or create a room for the user and emit their assigned role
const assignUserToRoom = async (socket, userId, selectedTime) => {
  const userRoomKey = `userRoom:${userId}`;

  const existingRoom = await redisClient.get(userRoomKey);
  if (existingRoom) {
    const roomInfo = JSON.parse(existingRoom);
    socket.emit("roleAssigned", roomInfo.role);
    return roomInfo.roomIndex;
  }

  let roomIndex = null;
  let role = null;
  const lobby = lobbies[selectedTime];

  for (let i = 0; i < lobby.length; i++) {
    if (!lobby[i].white) {
      lobby[i].white = userId;
      roomIndex = i;
      role = "w";
      break;
    } else if (!lobby[i].black) {
      lobby[i].black = userId;
      roomIndex = i;
      role = "b";
      break;
    }
  }

  if (roomIndex === null) {
    roomIndex = lobby.length;
    lobby.push({ roomIndex, white: userId, black: null, game: new Chess().fen(), time: selectedTime });
    role = "w";
  }

  await redisClient.set(userRoomKey, JSON.stringify({ roomIndex, role, time: selectedTime }));
  await redisClient.set("rooms", JSON.stringify(lobbies)); // Save updated lobbies to Redis
  socket.emit("roleAssigned", role);
  startTimer(roomIndex, selectedTime); // Start the timer for the new room
  return roomIndex;
};

// Middleware to check authentication
io.use(async (socket, next) => {
  cookieParser()(socket.request, socket.request.res || {}, (err) => {
    if (err) return next(err);

    const token = socket.request.cookies.token;
    if (!token) return next(new Error("Authentication Error"));

    try {
      const decoded = jwt.verify(token, secretKeyJWT);
      socket.decoded = decoded; // Attach decoded token payload to socket object

      const selectedTime = parseInt(socket.handshake.query.time, 10);
      assignUserToRoom(socket, decoded.id, selectedTime).then((roomIndex) => {
        if (roomIndex !== undefined) {
          socket.join(roomIndex.toString());
          const lobby = lobbies[selectedTime];
          const room = lobby.find(room => room.roomIndex === roomIndex);
          console.log(`User joined room ${roomIndex}`);
          // Emit initial game state
          socket.emit("gameState", room.game);
          socket.emit("players", { white: room.white, black: room.black });
          // Notify other player in the room
          socket.to(roomIndex.toString()).emit("players", { white: room.white, black: room.black });
        }
      });

      next();
    } catch (error) {
      return next(new Error("Token Verification Failed"));
    }
  });
});

io.on("connection", (socket) => {
  console.log("connected");

  // Handle incoming moves
  socket.on("move", async (move) => {
    const userId = socket.decoded.id;
    const userRoomKey = `userRoom:${userId}`;
    const userRoom = JSON.parse(await redisClient.get(userRoomKey));

    if (!userRoom) {
      console.log(`User room not found for user: ${userId}`);
      return;
    }

    const { roomIndex } = userRoom;
    const selectedTime = userRoom.time;
    const lobby = lobbies[selectedTime];
    const room = lobby.find(room => room.roomIndex === roomIndex);

    if (room) {
      const game = new Chess(room.game);
      const result = game.move(move);

      if (result) {
        // Update timer
        const timer = gameTimers[roomIndex];
        timer.currentPlayer = timer.currentPlayer === "w" ? "b" : "w";

        // Check for game-ending conditions
        let gameOver = false;
        let gameOverMessage = "";
        let winner = null;
        let loser = null;

        if (game.isCheckmate()) {
          gameOver = true;
          gameOverMessage = "Checkmate";
          winner = game.turn() === 'b' ? room.white : room.black;
          loser = game.turn() === 'b' ? room.black : room.white;
        } else if (game.isStalemate()) {
          gameOver = true;
          gameOverMessage = "Stalemate";
        } else if (game.isInsufficientMaterial()) {
          gameOver = true;
          gameOverMessage = "Insufficient material";
        } else if (game.isThreefoldRepetition()) {
          gameOver = true;
          gameOverMessage = "Threefold repetition";
        } else if (game.isDraw()) {
          gameOver = true;
          gameOverMessage = "Draw";
        }

        // Update game state in Redis
        room.game = game.fen();
        await redisClient.set("rooms", JSON.stringify(lobbies)); // Save updated lobbies to Redis

        // Emit updated game state to both players in the room
        io.to(roomIndex.toString()).emit("gameState", game.fen());

        if (gameOver) {
          io.to(roomIndex.toString()).emit("gameOver", gameOverMessage);
          // Save game result and remove the room from Redis
          const gameState = JSON.stringify(game.history({ verbose: true }));
          saveGameResult(room.white, room.black, winner, loser, gameState, (err) => {
            if (!err) {
              redisClient.del(userRoomKey);
            }
          });
          endGame(roomIndex, winner, gameOverMessage);
        }
      } else {
        socket.emit("invalidMove", "Invalid move");
      }
    }
  });

  // Handle disconnection
  socket.on("disconnect", async () => {
    const userId = socket.decoded.id;
    const userRoomKey = `userRoom:${userId}`;
    const userRoom = JSON.parse(await redisClient.get(userRoomKey));

    if (!userRoom) {
      console.log(`User room not found for user: ${userId}`);
      return;
    }

    const { roomIndex } = userRoom;
    const selectedTime = userRoom.time;
    const lobby = lobbies[selectedTime];

    const room = lobby.find(room => room.roomIndex === roomIndex);

    if (room.white === userId) {
      room.white = null;
      console.log(`User ${userId} left room ${roomIndex} (was white)`);
    } else if (room.black === userId) {
      room.black = null;
      console.log(`User ${userId} left room ${roomIndex} (was black)`);
    }

    // Optionally remove empty rooms after 20 seconds if still empty
    setTimeout(async () => {
      const updatedRoom = lobby.find(room => room.roomIndex === roomIndex);
      if (!updatedRoom.white && !updatedRoom.black) {
        const roomIndexInLobby = lobby.findIndex(room => room.roomIndex === roomIndex);
        lobby.splice(roomIndexInLobby, 1);
        console.log(`Room ${roomIndex} removed after 20 seconds of being empty`);
        await redisClient.set("rooms", JSON.stringify(lobbies)); // Save updated lobbies to Redis
      }
    }, 20000);

    await redisClient.set("rooms", JSON.stringify(lobbies)); // Save updated lobbies to Redis
    await redisClient.del(userRoomKey);
  });
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});