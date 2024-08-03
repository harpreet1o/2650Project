import { Chess } from 'chess.js';
import { io } from "socket.io-client";
import { useState, useMemo, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { UserContext } from './context/UserContext';

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

  const socket = useMemo(() => io("http://localhost:3000", {
    withCredentials: true,
    query: { time } // Pass the selected time as a query parameter
  }), [time]);

  useEffect(() => {
    if (!user) {
      navigate('/');
    }

    socket.on("connect", () => {
      console.log("connected", socket.id);
    });

    socket.on('roleAssigned', (assignedRole) => {
      console.log('Role assigned:', assignedRole);
      setPlayerRole(assignedRole);
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

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${minutes}:${sec < 10 ? '0' : ''}${sec}`;
  };

  return (
    <div>
      {gameOverMessage && <div className="game-over-message">{gameOverMessage}</div>}
      <div className="timers">
        <p>White: {formatTime(whiteTime)}</p>
        <p>Black: {formatTime(blackTime)}</p>
      </div>
      <p>{playerRole === 'b' ? (players.white != null ? players.white : "not connected yet") : (players.black != null ? players.black : "not connected yet")}</p>
      <div className={`grid grid-cols-8 grid-rows-8 gap-0 border-2 border-gray-800 w-80 h-80 ${playerRole === "b" ? "rotate-180" : ""}`}>
        {board.map((row, rowIndex) =>
          row.map((square, squareIndex) => (
            <div
              key={(rowIndex) * 8 + (squareIndex)}
              onClick={() => handleSquareClick(rowIndex, squareIndex, square)}
              className={`w-full h-full flex items-center justify-center cursor-pointer ${(rowIndex + squareIndex) % 2 === 0 ? "bg-green-400" : "bg-green-800"} ${playerRole === "b" ? "rotate-180" : ""} ${selectedSquare && selectedSquare.row === rowIndex && selectedSquare.col === squareIndex ? "bg-yellow-500" : ""} ${isAvailableMove(rowIndex, squareIndex) ? "bg-blue-300" : ""}`}
            >
              <span
                className={`text-2xl ${square && square.color === "w" ? "text-white" : "text-black"}`}
              >
                 {getPieceUnicode(square
                 )}
              </span>
            </div>
          ))
        )}
      </div>
      <p>{playerRole === 'w' ? (players.white != null ? players.white : "not connected yet") : (players.black != null ? players.black : "not connected yet")}</p>
    </div>
  );
}
