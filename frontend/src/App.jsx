import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import ChessBoard from './ChessBoard';
import Navbar from './components/Navbar';
import Home from './Home';


export default function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Home/>} />
        <Route path="/chessboard" element={<ChessBoard />} />
      </Routes>
    </Router>
  )
}