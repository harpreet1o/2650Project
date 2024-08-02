import express from "express";
import { Server } from "socket.io";
import { createServer } from "http";
import cors from "cors";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";

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

// Initialize rooms as an array of objects with properties for each player
const rooms = [];

// Map to keep track of user IDs and their assigned room and role
const userRoomMap = new Map();

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  })
);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/login", (req, res) => {
  const token = jwt.sign({ _id: "asdas" }, secretKeyJWT);

  res
    .cookie("token", token, { httpOnly: true, secure: true, sameSite: "none" })
    .json({
      message: "Login Success",
    });
});

// Function to get or create a room for the user and emit their assigned role
const assignUserToRoom = (socket, userId) => {
  if (userRoomMap.has(userId)) {
    // If user already has a room, reassign them to it
    const { roomIndex, role } = userRoomMap.get(userId);
    socket.emit("roleAssigned", role);
    return roomIndex;
  }

  // Assign to a new room if user doesn't have an existing assignment
  for (let i = 0; i < rooms.length; i++) {
    if (!rooms[i].white) {
      rooms[i].white = userId;
      userRoomMap.set(userId, { roomIndex: i, role: "white" });
      socket.emit("roleAssigned", "white");
      return i;
    } else if (!rooms[i].black) {
      rooms[i].black = userId;
      userRoomMap.set(userId, { roomIndex: i, role: "black" });
      socket.emit("roleAssigned", "black");
      return i;
    }
  }
  // If all rooms are full, create a new room
  const newRoomIndex = rooms.length;
  rooms.push({ white: userId, black: null });
  userRoomMap.set(userId, { roomIndex: newRoomIndex, role: "white" });
  socket.emit("roleAssigned", "white");
  return newRoomIndex;
};

// Middleware to check authentication
io.use((socket, next) => {
  cookieParser()(socket.request, socket.request.res || {}, (err) => {
    if (err) return next(err);

    const token = socket.request.cookies.token;
    if (!token) return next(new Error("Authentication Error"));

    try {
      const decoded = jwt.verify(token, secretKeyJWT);
      socket.decoded = decoded; // Attach decoded token payload to socket object

      const roomIndex = assignUserToRoom(socket, decoded._id); // Assign room and role to user

      if (roomIndex !== undefined) {
        socket.join(roomIndex.toString());
        console.log(`User joined room ${roomIndex}`);
      }

      next();
    } catch (error) {
      return next(new Error("Token Verification Failed"));
    }
  });
});

io.on("connection", (socket) => {
  console.log("connected");
  console.log(socket.id);
//   socket.on("move")

  // Handle disconnection
  socket.on("disconnect", () => {
    const userId = socket.decoded._id;
    rooms.forEach((room, index) => {
      if (room.white === userId) {
        room.white = null;
        console.log(`User ${userId} left room ${index} (was white)`);
      } else if (room.black === userId) {
        room.black = null;
        console.log(`User ${userId} left room ${index} (was black)`);
      }

      // Optionally remove empty rooms
      if (!room.white && !room.black) {
        rooms.splice(index, 1);
        console.log(`Room ${index} removed because it is empty`);
      }
    });
    userRoomMap.delete(userId); // Remove user from the map on disconnect
  });
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
