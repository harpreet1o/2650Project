import express from "express";
import { Server } from "socket.io";
import http from "http";
import { Chess } from "chess.js";
import path from "path";
import { fileURLToPath } from "url";

// These lines are needed to properly handle __dirname with ES6 modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app= express();

const server=http.createServer(app);
const io= new Server(server);

const chess = new Chess();

let players={};
let currentPlayer;
app.set("view engine","ejs");
app.use(express.static(path.join(__dirname,"public")));

app.get("/",(req,res)=>{
    res.render("index")
})
io.on("connection",(socket)=>{
    console.log("connected")
})

server.listen(3000,function(){
    console.log("listening on port")
})