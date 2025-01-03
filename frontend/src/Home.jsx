// components/Home.js
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from './context/UserContext';
import Games from './components/Games';
import { FaChessKing, FaClock, FaGamepad } from "react-icons/fa";

const Home = () => {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const [selectedTime, setSelectedTime] = useState('1'); // Default to 1 minute
  const [message, setMessage] = useState('');

  const handleCreateGame = () => {
    if (user) {
      navigate('/chessboard', { state: { time: selectedTime } });
    } else {
      setMessage('Please log in to create a game.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800">
      <div className="container mx-auto px-8 py-10">
        {/* Header Section */}
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-teal-700 mb-4 flex items-center justify-center space-x-3">
            <FaChessKing className="text-teal-600" size={40} />
            <span>Welcome to the Chess Game</span>
          </h1>
          <p className="text-lg text-gray-600">
            Play chess in a random match. Select your settings and start playing!
          </p>
        </header>

        {/* Alert Message */}
        {message && (
          <div
            className="max-w-lg mx-auto bg-teal-100 border border-teal-500 text-teal-800 text-lg px-4 py-3 rounded relative mb-8 flex items-center space-x-2"
            role="alert"
          >
            <FaGamepad className="text-teal-700" size={24} />
            <span>{message}</span>
          </div>
        )}

        {/* Content Section */}
        {/* Game Time Selection */}
        <div className="bg-white w-[400px] m-auto shadow-lg p-6 rounded-lg">
          <h2 className="text-2xl font-semibold text-teal-700 flex items-center mb-4">
            <FaClock className="mr-2 text-teal-600" size={28} />
            Game Time
          </h2>
          <label className="block mb-6">
            <span className="block text-lg font-medium text-gray-700 mb-2">
              Choose your time:
            </span>
            <select
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="border border-teal-400 text-gray-800 px-4 py-2 rounded-lg w-full focus:ring-2 focus:ring-teal-700 focus:outline-none"
            >
              <option value="1">1 Minute</option>
              <option value="5">5 Minutes</option>
              <option value="10">10 Minutes</option>
            </select>
          </label>
          <button
            onClick={handleCreateGame}
            className="w-full bg-teal-600 text-white text-lg font-medium py-3 rounded-lg hover:bg-teal-700 transition"
          >
            Play Game
          </button>
        </div>

        {/* Additional Content (Icons & Info) */}

        <Games />
      </div>
    </div>
  );
};

export default Home;
