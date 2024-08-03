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
app.post("/creatRoom",(req,res)=>{
const 
})

const gameTimers = {};
const lobbies = {
  1: [], // 1 minute lobby
  5: [], // 5 minutes lobby
  10: [] // 10 minutes lobby
};

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
  