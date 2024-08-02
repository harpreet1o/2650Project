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

const secretKeyJWT = "asdasdsadasdasdasdsa";
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

// Create Redis client
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
app.use('/', authRoutes);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/login", (req, res) => {
  const user = Math.floor(Math.random() * 1000);
  const token = jwt.sign({ _id: user }, secretKeyJWT);

  res
    .cookie("token", token, { httpOnly: true, secure: true, sameSite: "none" })
    .json({
      message: "Login Success",
    });
});

// Function to get or create a room for the user and emit their assigned role
const assignUserToRoom = async (socket, userId) => {
  const userRoomKey = `userRoom:${userId}`;

  const existingRoom = await redisClient.get(userRoomKey);
  if (existingRoom) {
    const roomInfo = JSON.parse(existingRoom);
    socket.emit("roleAssigned", roomInfo.role);
    return roomInfo.roomIndex;
  }

  let roomIndex = null;
  let role = null;
  const rooms = JSON.parse(await redisClient.get("rooms") || "[]");

  for (let i = 0; i < rooms.length; i++) {
    if (!rooms[i].white) {
      rooms[i].white = userId;
      roomIndex = i;
      role = "w";
      break;
    } else if (!rooms[i].black) {
      rooms[i].black = userId;
      roomIndex = i;
      role = "b";
      break;
    }
  }

  if (roomIndex === null) {
    roomIndex = rooms.length;
    rooms.push({ white: userId, black: null, game: new Chess().fen() });
    role = "w";
  }

  await redisClient.set("rooms", JSON.stringify(rooms));
  await redisClient.set(userRoomKey, JSON.stringify({ roomIndex, role }));

  socket.emit("roleAssigned", role);
  return roomIndex;
};

// Middleware to check authentication
io.use(async (socket, next) => {
  cookieParser()(socket.request, socket.request.res || {}, (err) => {
    if (err) return next(err);

    const token = socket.request.cookies.token;
    console.log(token);
    if (!token) return next(new Error("Authentication Error"));

    try {
      const decoded = jwt.verify(token, secretKeyJWT);
      socket.decoded = decoded; // Attach decoded token payload to socket object

      assignUserToRoom(socket, decoded._id).then((roomIndex) => {
        if (roomIndex !== undefined) {
          socket.join(roomIndex.toString());
          redisClient.get("rooms").then((rooms) => {
            const room = JSON.parse(rooms)[roomIndex];
            console.log(`User joined room ${roomIndex}`);
            // Emit initial game state
            socket.emit("gameState", room.game);
            socket.emit("players", { white: room.white, black: room.black });
            // Notify other player in the room
            socket.to(roomIndex.toString()).emit("players", { white: room.white, black: room.black });
          });
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
    const userId = socket.decoded._id;
    const userRoomKey = `userRoom:${userId}`;
    const userRoom = JSON.parse(await redisClient.get(userRoomKey));
    const { roomIndex } = userRoom;
    const rooms = JSON.parse(await redisClient.get("rooms"));
    const room = rooms[roomIndex];

    if (room) {
      const game = new Chess(room.game);
      const result = game.move(move);

      if (result) {
        // Check for game-ending conditions
        let gameOver = false;
        let gameOverMessage = "";

        if (game.isCheckmate()) {
          gameOver = true;
          gameOverMessage = "Checkmate";
        }else if (game.isStalemate()) {
          gameOver = true;
          gameOverMessage = "Stalemate";
        }
        else if (game.isInsufficientMaterial()) {
          gameOver = true;
          gameOverMessage = "Insufficient material";
        }
        else if (game.isThreefoldRepetition()) {
          gameOver = true;
          gameOverMessage = "Threefold repetition";
        }
        // Update game state in Redis
        room.game = game.fen();
        await redisClient.set("rooms", JSON.stringify(rooms));

        // Emit updated game state to both players in the room
        io.to(roomIndex.toString()).emit("gameState", game.fen());

        if (gameOver) {
          io.to(roomIndex.toString()).emit("gameOver", gameOverMessage);
        }
      } else {
        socket.emit("invalidMove", "Invalid move");
      }
    }
  });

  // Handle disconnection
  socket.on("disconnect", async () => {
    const userId = socket.decoded._id;
    const userRoomKey = `userRoom:${userId}`;
    const userRoom = JSON.parse(await redisClient.get(userRoomKey));
    const { roomIndex } = userRoom;
    const rooms = JSON.parse(await redisClient.get("rooms"));

    if (rooms[roomIndex].white === userId) {
      rooms[roomIndex].white = null;
      console.log(`User ${userId} left room ${roomIndex} (was white)`);
    } else if (rooms[roomIndex].black === userId) {
      rooms[roomIndex].black = null;
      console.log(`User ${userId} left room ${roomIndex} (was black)`);
    }

    // Optionally remove empty rooms
    // if (!rooms[roomIndex].white && !rooms[roomIndex].black) {
    //   rooms.splice(roomIndex, 1);
    //   console.log(`Room ${roomIndex} removed because it is empty`);
    // }

    await redisClient.set("rooms", JSON.stringify(rooms));
    await redisClient.del(userRoomKey);
  });
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
