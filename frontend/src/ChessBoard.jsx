import { Chess } from 'chess.js';
import { io } from "socket.io-client";
import { useState, useMemo, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { UserContext } from './context/UserContext';
import { FaUser } from 'react-icons/fa';


// Import piece images
import wP from './images/chess-pieces/wP.png';
import wR from './images/chess-pieces/wR.png';
import wN from './images/chess-pieces/wN.png';
import wB from './images/chess-pieces/wB.png';
import wQ from './images/chess-pieces/wQ.png';
import wK from './images/chess-pieces/wK.png';
import bP from './images/chess-pieces/bP.png';
import bR from './images/chess-pieces/bR.png';
import bN from './images/chess-pieces/bN.png';
import bB from './images/chess-pieces/bB.png';
import bQ from './images/chess-pieces/bQ.png';
import bK from './images/chess-pieces/bK.png';

export default function ChessBoard() {
  const chess = useMemo(() => new Chess(), []);
  const [board, setBoard] = useState(chess.board());
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [availableMoves, setAvailableMoves] = useState([]);
  const [playerRole, setPlayerRole] = useState("w");
  const [players, setPlayers] = useState({ white: null, black: null });
  const [gameOverMessage, setGameOverMessage] = useState(null);
  const [whiteTime, setWhiteTime] = useState(300); // Initial time in seconds
  const [blackTime, setBlackTime] = useState(300);

  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const location = useLocation();
  const { time } = location.state; // Access the selected time

  const socket = useMemo(() => {
    if (user) {
      return io("http://localhost:3000", {
        withCredentials: true,
        query: { time, username: user } // Include username in query parameters
      });
    }
    return null;
  }, [time]);

  useEffect(() => {
    if (!user) {
      navigate('/');
    }

    socket.on("connect", () => {
      console.log("connected", socket.id);
    });

    socket.on('roleAssigned', ({ role, userName, socketId }) => {
      console.log('Role assigned:', role);
      setPlayerRole(role);
      setPlayers(prev => ({ ...prev, [role === "w" ? "white" : "black"]: { userName, socketId } }));
    });

    socket.on("gameState", (fen) => {
      chess.load(fen);
      setBoard([...chess.board()]);
    });

    socket.on("players", (players) => {
      console.log(players);
      setPlayers(players);
    });

    socket.on("gameOver", (message) => {
      console.log("Game Over: " + message);
      setGameOverMessage(message);
    });

    socket.on("timerUpdate", ({ whiteTime, blackTime }) => {
      setWhiteTime(whiteTime);
      setBlackTime(blackTime);
    });

    return () => {
      socket.off("connect");
      socket.off("roleAssigned");
      socket.off("gameState");
      socket.off("players");
      socket.off("gameOver");
      socket.off("timerUpdate");
    };
  }, [socket, chess, navigate, user]);

  const getPieceImage = (piece) => {
    const pieceImages = {
      p: bP,
      r: bR,
      n: bN,
      b: bB,
      q: bQ,
      k: bK,
      P: wP,
      R: wR,
      N: wN,
      B: wB,
      Q: wQ,
      K: wK,
    };
    const imageKey = piece ? (piece.color === 'w' ? piece.type.toUpperCase() : piece.type) : '';

    return piece ? pieceImages[imageKey] : '';
  };

  const handleSquareClick = (rowIndex, squareIndex, square) => {
    if (gameOverMessage) return;

    if (selectedSquare) {
      if (selectedSquare.row !== rowIndex || selectedSquare.col !== squareIndex) {
        handleMove(selectedSquare, { row: rowIndex, col: squareIndex });
      }
      setSelectedSquare(null);
      setAvailableMoves([]);
    } else if (square && square.color === playerRole) {
      setSelectedSquare({ row: rowIndex, col: squareIndex });
      const moves = chess.moves({ square: `${String.fromCharCode(97 + squareIndex)}${8 - rowIndex}`, verbose: true });
      setAvailableMoves(moves.map(move => move.to));
    }
  };

  const handleMove = (source, target) => {
    const move = {
      from: `${String.fromCharCode(97 + source.col)}${8 - source.row}`,
      to: `${String.fromCharCode(97 + target.col)}${8 - target.row}`,
      promotion: 'q'
    };

    const result = chess.move(move);

    if (result) {
      setBoard([...chess.board()]);
      socket.emit("move", move);
    } else {
      console.log("Invalid move");
    }
  };

  const isAvailableMove = (rowIndex, colIndex) => {
    return availableMoves.includes(`${String.fromCharCode(97 + colIndex)}${8 - rowIndex}`);
  };

  const handleResign = () => {
    socket.emit('resign');
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${minutes}:${sec < 10 ? '0' : ''}${sec}`;
  };

  return (
    <div className="p-4 bg-gray-100 text-gray-800 min-h-screen flex flex-col justify-center items-center">
      {/* display game over */}
      {gameOverMessage && (
        <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md w-full">
            <p className="text-2xl font-bold text-gray-800 mb-6">{gameOverMessage}</p>
            <button
              onClick={() => navigate('/')}
              className="bg-teal-600 text-white py-2 px-6 rounded-lg hover:bg-teal-700 transition duration-300"
            >
              Go Home
            </button>
          </div>
        </div>
      )}

      {/* // display game stat */}
      <div className="mb-4 flex justify-between w-full max-w-lg">
        <div className="text-lg font-extrabold">White: <span className='text-teal-600'>{formatTime(whiteTime)}</span></div>
        <div className="text-lg font-extrabold">Black: <span className='text-teal-600'>{formatTime(blackTime)}</span></div>
      </div>
      <div className="flex justify-between w-full max-w-lg mb-4">
        <div className="flex items-center space-x-2">
          <FaUser size={24} className="text-gray-800" />
          <span className="font-semibold">{players.white ? players.white.userName : "Not connected yet"}</span>
        </div>
        <div className="flex items-center space-x-2 text-right">
          <FaUser size={24} className="text-gray-800" />
          <span className="font-semibold">{players.black ? players.black.userName : "Not connected yet"}</span>
        </div>
      </div>

      {/* // display chess board */}
      <div className={`bg-gray-800 shadow-lg grid grid-cols-8 gap-0.5 ${playerRole === "b" ? "transform rotate-180" : ""}`}>
        {board.map((row, rowIndex) =>
          row.map((square, squareIndex) => (
            <div
              key={rowIndex * 8 + squareIndex}
              onClick={() => handleSquareClick(rowIndex, squareIndex, square)}
              className={`w-16 h-16 flex justify-center items-center border-2 ${(rowIndex + squareIndex) % 2 === 0 ? 'bg-gray-200' : 'bg-teal-600'
                } 
                ${playerRole === "b" ? "transform rotate-180" : ""}
                ${selectedSquare && selectedSquare.row === rowIndex && selectedSquare.col === squareIndex ? 'bg-teal-500' : ''} 
                ${isAvailableMove(rowIndex, squareIndex) ? 'bg-cyan-500' : ''}`}
            >
              {square && square.type && (
                <img src={getPieceImage(square)} alt={square.type} className="w-12 h-12" />
              )}
            </div>
          ))
        )}
      </div>

      <button
        onClick={handleResign}
        className="mt-6 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-700"
      >
        Resign
      </button>
    </div>
  );
}
