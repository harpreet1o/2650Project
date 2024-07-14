import express from "express";
import { Server } from "socket.io";
import http from "http";
import { Chess } from "chess.js";
import path from "path";
import { fileURLToPath } from "url";
import { log } from "console";

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
    if(!players.white){
        players.white=socket.id;
        socket.emit("playerRole","w");
    }
    else if(!players.black){
        players.black=socket.id;
        socket.emit("playerRole","b");
    }
    else{
    socket.emit("spectatorRole");
    }
    socket.on("move",(move)=>{
        try{
            if(chess.turn()==='w'&& socket.id !==players.white) return;
            if(chess.turn()==='b'&& socket.id !==players.black) return;

            const result=chess.move(move);
            if(result){
                currentPlayer=chess.turn();
                io.emit("move",move);
                io.emit("boardState",chess.fen())
        }
        else{
            console.log("Invalid move:",move);
            socket.emit("InvalidMove",move);
        }
    }
        catch(err){
          console.log(err);
          socket.emit("Invalid move:",move);
            }

        
    })
    socket.on("disconnect",()=>{
        if(socket.id===players.white){
            delete players.white;
        }
        if(socket.id===players.black){
            delete players.black;
        }
        
        // console.log("disconnected");
    })
})

server.listen(3000,function(){
    console.log("listening on port")
})