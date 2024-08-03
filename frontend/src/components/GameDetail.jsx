// src/components/GameDetail.js
import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Chess } from 'chess.js';

const GameDetail = () => {
    const location = useLocation();
    const game = location.state?.game;

    const chess = useMemo(() => new Chess(), []);
    const [board, setBoard] = useState([]);
    const [selectedMoveIndex, setSelectedMoveIndex] = useState(0);

    useEffect(() => {
        if (game && game.game_state) {
            updateBoard(selectedMoveIndex);
        }
    }, [game, chess, selectedMoveIndex]);

    const updateBoard = (moveIndex) => {
        chess.reset();
        for (let i = 0; i <= moveIndex; i++) {
            chess.move(game.game_state[i]);
        }
        setBoard(chess.board());
    };

    const handleMoveClick = (moveIndex) => {
        setSelectedMoveIndex(moveIndex);
    };

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

    if (!game) {
        return <div className="text-center text-red-500">Game not found</div>;
    }

    return (
        <div className="container mx-auto mt-8">
            <h1 className="text-2xl font-bold mb-6">Game Detail</h1>
            <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
                <p><strong>White Player:</strong> {game.white_player}</p>
                <p><strong>Black Player:</strong> {game.black_player}</p>
                <p><strong>Winner:</strong> {game.winner}</p>
                <p><strong>Loser:</strong> {game.loser}</p>
                <p><strong>Timestamp:</strong> {new Date(game.timestamp).toLocaleString()}</p>
            </div>

            <div className="grid grid-cols-8 grid-rows-8 gap-0 border-2 border-gray-800 w-80 h-80">
                {board.map((row, rowIndex) =>
                    row.map((square, squareIndex) => (
                        <div
                            key={(rowIndex) * 8 + (squareIndex)}
                            className={`w-full h-full flex items-center justify-center ${(rowIndex + squareIndex) % 2 === 0 ? "bg-green-400" : "bg-green-800"}`}
                        >
                            <span
                                className={`text-2xl ${square && square.color === "w" ? "text-white" : "text-black"}`}
                            >
                                {getPieceUnicode(square)}
                            </span>
                        </div>
                    ))
                )}
            </div>
            <div className="grid grid-cols-4 gap-4 mb-6">
                {game.game_state.map((move, index) => (
                    <button
                        key={index}
                        onClick={() => handleMoveClick(index)}
                        className={`p-2 border rounded ${selectedMoveIndex === index ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                    >
                        Move {index + 1}: {move.from} to {move.to}
                    </button>
                ))}
            </div>

            
        </div>
    );
};

export default GameDetail;
