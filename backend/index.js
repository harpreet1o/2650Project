import "dotenv/config.js";

import express from "express";
import { Server } from "socket.io";
import http from "http";
import cors from "cors";
import { Chess } from "chess.js";
import path from "path";
import { fileURLToPath } from "url";
import { log } from "console";
import cookieParser from "cookie-parser";
import session from 'express-session';
import passport from 'passport';
import pluralize from 'pluralize';
import RedisStore from "connect-redis"
import redis from 'redis';

import logger from "morgan";
import indexRouter from "./routes/index.js";
import authRouter from "./routes/auth.js";
import connectDB from "./db.js";

// These lines are needed to properly handle __dirname with ES6 modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// connect to Database
connectDB()

const server = http.createServer(app);
const io = new Server(server);

const chess = new Chess();

let players = {};
let currentPlayer;
app.set("view engine", "ejs");

app.locals.pluralize = pluralize;

// Middlewares
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}))
app.use(express.json());
app.use(logger("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// redis setup
let redisClient;

(async () => {
  redisClient = redis.createClient();

  redisClient.on("error", (error) => console.error(`Error : ${error}`));

  await redisClient.connect();
})();

// Use the session middleware
app.use(session({
    store: new RedisStore({ client: redisClient }),
    secret: 'keyboard cat',
    resave: false, // don't save session if unmodified
    saveUninitialized: false, // don't create session until something stored
    cookie: {
        secure: process.env.NODE_ENV === 'production', // Set to true if using HTTPS
        maxAge: 1000 * 60 * 60 * 24 // Session expires after 1 day
    }
}));

app.use(passport.authenticate('session'));

// router for authentication
app.use("/", authRouter)

app.get("/", (req, res) => {
    const user = req.user
    console.log(user)
    res.render("index", { title: "Chess!", user: user });
})
io.on("connection", (socket) => {
    console.log("connected")
    if (!players.white) {
        players.white = socket.id;
        socket.emit("playerRole", "w");
    }
    else if (!players.black) {
        players.black = socket.id;
        socket.emit("playerRole", "b");
    }
    else {
        socket.emit("spectatorRole");
    }
    socket.on("move", (move) => {
        try {
            if (chess.turn() === 'w' && socket.id !== players.white) return;
            if (chess.turn() === 'b' && socket.id !== players.black) return;

            const result = chess.move(move);
            if (result) {
                currentPlayer = chess.turn();
                io.emit("move", move);
                io.emit("boardState", chess.fen())
            }
            else {
                console.log("Invalid move:", move);
                socket.emit("InvalidMove", move);
            }
        }
        catch (err) {
            console.log(err);
            socket.emit("Invalid move:", move);
        }


    })
    socket.on("disconnect", () => {
        if (socket.id === players.white) {
            delete players.white;
        }
        if (socket.id === players.black) {
            delete players.black;
        }
        
        // console.log("disconnected");
    })
})

server.listen(3000, function () {
    console.log("listening on port")
})