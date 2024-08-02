// components/Home.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();
  const [selectedTime, setSelectedTime] = useState('1'); // Default to 1 minute

  const handleCreateGame = () => {
    navigate('/chessboard', { state: { time: selectedTime } });
  };

  return (
    <div>
      <h1>Welcome to the Chess Game</h1>
      <label>
        Select Game Time:
        <select value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)}>
          <option value="1">1 Minute</option>
          <option value="5">5 Minutes</option>
          <option value="10">10 Minutes</option>
        </select>
      </label>
      <button onClick={handleCreateGame}>Create Game</button>
    </div>
  );
};

export default Home;
