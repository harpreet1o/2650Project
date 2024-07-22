import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import { Chess } from 'chess.js';
import ChessBoard from './ChessBoard';
import Navbar from './components/Navbar';


export default function App() {
  const chess = new Chess();
  const board = chess.board();
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<ChessBoard board={board} />} />
      </Routes>
    </Router>
  )
}


