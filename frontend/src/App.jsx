import React from 'react';
import { Chess } from 'chess.js';
import ChessBoard from './ChessBoard';


export default function App() {
  const chess = new Chess();
  const board=chess.board();
  return(
    <ChessBoard board={board}/>
  )

 
        }
          
   
