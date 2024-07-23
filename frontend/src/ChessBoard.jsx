import { Chess } from 'chess.js';
import { io } from "socket.io-client";
import { useState,useMemo,useEffect } from 'react';
export default function ChessBoard(){
   const chess = new Chess();
  const board=chess.board();
  const [draggedPiece, setDraggedPiece] = useState(null);
  const [sourceSquare, setSourceSquare] = useState(null);
  const [playerRole,setPlayerRole]=useState("w");

  const socket = useMemo(
    () =>
      io("http://localhost:3000", {
        withCredentials: true,
      }),
    []
  );
  useEffect(() => {
    socket.on("connect", () => {
      console.log("connected", socket.id);
    });
  })
    
const getPieceUnicode = (piece) => {
    const unicodePieces = {
      p: '♙',
      r: '♜',
      n: '♞',
      b: '♝',
      q: '♛',
      k: '♚',
      P: '♙',
      R: '♖',
      N: '♘',
      B: '♗',
      Q: '♕',
      K: '♔',
    };
    return piece ? unicodePieces[piece.type] : '';
  };
  const onDragStart = (e, rowIndex, squareIndex, square) => {
    if (e.target.draggable&&square?.color==playerRole) {
      setDraggedPiece(e.target);
      setSourceSquare({ row: rowIndex, col: squareIndex });
    }
  };

  const onDragEnd = () => {
    setDraggedPiece(null);
    setSourceSquare(null);
  };

  const onDragOver = (e) => {
    e.preventDefault();
  };

  const onDrop = (e, targetRow, targetCol) => {
    e.preventDefault();
       if (draggedPiece) {
      handleMove(sourceSquare, { row: targetRow, col: targetCol });
    }
  };

  const handleMove = (source, target) => {
  
    const move = {
        from: `${String.fromCharCode(97 + source.col)}${8 - source.row}`,
        to: `${String.fromCharCode(97 + target.col)}${8 - target.row}`,
        promotion: 'q'
    };
    console.log(move);
    
};

  
    return (
        <div className={`grid grid-cols-8 grid-rows-8 gap-0 border-2 border-gray-800 w-80 h-80 ${playerRole=="b"?"rotate-180":""}`}>
          {board.map((row, rowIndex) =>
            row.map((square,squareIndex)=>{

              return (
          
                <div
                  key={(rowIndex)*8+(squareIndex)}
                  onDragOver={(e) => onDragOver(e)}
                  onDrop={(e) => onDrop(e, rowIndex, squareIndex)}

                  className={`w-full h-full flex items-center justify-center cursor-grab ${(rowIndex + squareIndex) % 2 === 0 ?"bg-green-400":"bg-green-800"} ${playerRole=="b"?"rotate-180":""}`}
                >
                  <span
                draggable={true}
                onDragStart={(e) => onDragStart(e, rowIndex, squareIndex, square)}
                onDragEnd={onDragEnd}
                className={`text-2xl ${square&& square.color === "w" ? "text-white" : "text-black" }`}
              >
                {getPieceUnicode(square)}
              </span>
                </div>
              )
    })
    )}
            </div>
          );
}