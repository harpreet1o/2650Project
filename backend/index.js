import "dotenv/config.js";
import express from "express";
import { Server } from "socket.io";
import http from "http";
import cors from "cors";
import { Chess } from "chess.js";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import session from 'express-session';
import passport from 'passport';
import pluralize from 'pluralize';
import RedisStore from "connect-redis"
import redis from 'redis';
import { v4 as uuidV4 } from 'uuid';
import logger from "morgan";
import userRouter from "./routes/user.js";
import authRouter from "./routes/auth.js";
import connectDB from "./db.js";
import onGameCompleted from "./controllers/game.js";

// These lines are needed to properly handle __dirname with ES6 modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// connect to Database
connectDB()

const server = http.createServer(app);
const io = new Server(server, {
    cors: '*', // allow connection from any origin
});

const rooms = new Map();

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
app.use("/user", userRouter)


app.get("/", (req, res) => {
    const user = req.user
    console.log(user)
    res.render("index", { title: "Chess!", user: user });
})

// io.connection
io.on('connection', (socket) => {
    // socket refers to the client socket that just got connected.
    // each socket is assigned an id
    console.log(socket.id, 'connected');

    // listen to username event
    socket.on('username', (username) => {
        console.log('username:', username);
        socket.data.username = username;
    });

    // createRoom
    socket.on('createRoom', async (callback) => { // callback here refers to the callback function from the client passed as data
        const roomId = uuidV4(); // <- 1 create a new uuid
        await socket.join(roomId); // <- 2 make creating user join the room

        // set roomId as a key and roomData including players as value in the map
        rooms.set(roomId, { // <- 3
            roomId,
            players: [{ id: socket.id, username: socket.data?.username }]
        });
        // returns Map(1){'2b5b51a9-707b-42d6-9da8-dc19f863c0d0' => [{id: 'socketid', username: 'username1'}]}

        callback(roomId); // <- 4 respond with roomId to client by calling the callback function from the client
    });

    // get available rooms
    socket.on('getAvailableRooms', (callback) => {
        const availableRooms = Array.from(rooms.values()).filter(room => room.players.length < 2);
        callback(availableRooms.map(room => room.roomId));
    });

    // joining a room
    socket.on('joinRoom', async (args, callback) => {
        // check if room exists and has a player waiting
        const room = rooms.get(args.roomId);
        let error, message;

        if (!room) { // if room does not exist
            error = true;
            message = 'room does not exist';
        } else if (room.players.length <= 0) { // if room is empty set appropriate message
            error = true;
            message = 'room is empty';
        } else if (room.players.length >= 2) { // if room is full
            error = true;
            message = 'room is full'; // set message to 'room is full'
        }

        if (error) {
            // if there's an error, check if the client passed a callback,
            // call the callback (if it exists) with an error object and exit or 
            // just exit if the callback is not given

            if (callback) { // if user passed a callback, call it with an error payload
                callback({
                    error,
                    message
                });
            }

            return; // exit
        }

        await socket.join(args.roomId); // make the joining client join the room

        // add the joining user's data to the list of players in the room
        const roomUpdate = {
            ...room,
            players: [
                ...room.players,
                { id: socket.id, username: socket.data?.username },
            ],
        };

        rooms.set(args.roomId, roomUpdate);

        callback(roomUpdate); // respond to the client with the room details.

        // emit an 'opponentJoined' event to the room to tell the other player that an opponent has joined
        socket.to(args.roomId).emit('opponentJoined', roomUpdate);
    });

    //moving the pieces
    socket.on('move', (data) => {
        // emit to all sockets in the room except the emitting socket.
        socket.to(data.room).emit('move', data.move);
    });

    socket.on('gameCompleted', ({ winnerId, loserId }) => {
        onGameCompleted(winnerId, loserId);
    });


    // disconnect
    socket.on("disconnect", () => {
        const gameRooms = Array.from(rooms.values()); // <- 1

        gameRooms.forEach((room) => { // <- 2
            const userInRoom = room.players.find((player) => player.id === socket.id); // <- 3

            if (userInRoom) {
                if (room.players.length < 2) {
                    // if there's only 1 player in the room, close it and exit.
                    rooms.delete(room.roomId);
                    return;
                }

                socket.to(room.roomId).emit("playerDisconnected", userInRoom); // <- 4
            }
        });
    });

    // close room
    socket.on("closeRoom", async (data) => {
        socket.to(data.roomId).emit("closeRoom", data); // <- 1 inform others in the room that the room is closing
    
        const clientSockets = await io.in(data.roomId).fetchSockets(); // <- 2 get all sockets in a room
    
        // loop over each socket client
        clientSockets.forEach((s) => {
          s.leave(data.roomId); // <- 3 and make them leave the room on socket.io
        });
    
        rooms.delete(data.roomId); // <- 4 delete room from rooms map
      });
});

server.listen(3000, function () {
    console.log("listening on port")
})
