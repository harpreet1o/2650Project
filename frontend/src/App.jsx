import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import { Chess } from 'chess.js';
import ChessBoard from './ChessBoard';
import Navbar from './components/Navbar';


export default function App() {
  
  return(
    <ChessBoard />
  )
}


