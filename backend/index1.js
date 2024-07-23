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
const room=[];

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
  const room=[];
  const getRoomForUser=((decoded.userId)=>{
    const currentRoom=room.length()-1;
    if(room[currentRoom].length==1){
        return currentRoom;
    }
    else
    return currentRoom+1;
  });
  io.use((socket, next) => {
    cookieParser()(socket.request, socket.request.res, (err) => {
      if (err) return next(err);
      io.use((socket, next) => {
        cookieParser()(socket.request, socket.request.res, (err) => {
          if (err) return next(err);
      
          const token = socket.request.cookies.token;
          if (!token) return next(new Error("Authentication Error"));
      
          try {
            const decoded = jwt.verify(token, secretKeyJWT);
            socket.decoded = decoded; // Attach decoded token payload to socket object
      
            // Example: Logic to determine room assignment based on user's previous state
            const previousRoom = getRoomForUser(decoded.userId); // Example function to get previous room
      
            if (previousRoom) {
              socket.join(previousRoom);
              console.log(`User joined previous room ${previousRoom}`);
            }
      
            next();
            
          } catch (error) {
            return next(new Error("Token Verification Failed"));
          }
        })
    });
  });
});
  io.on("connection", (socket) => {
    console.log("connected");console.log(socket.id);
    
  })
  server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });