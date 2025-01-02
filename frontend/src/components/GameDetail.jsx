import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Chess } from 'chess.js';
import { FaUserAlt, FaClock, FaChessKnight } from 'react-icons/fa';

const GameDetail = () => {
    const location = useLocation();
    const game = location.state?.game;

    const chess = useMemo(() => new Chess(), []);
    const [board, setBoard] = useState([]);
    const [selectedMoveIndex, setSelectedMoveIndex] = useState(0);

    useEffect(() => {
        if (game && JSON.parse(game.game_state).length > 0) {
            updateBoard(selectedMoveIndex);
        }
    }, [game, chess, selectedMoveIndex]);

    const updateBoard = (moveIndex) => {
        chess.reset();
        const gameState = JSON.parse(game.game_state);
        for (let i = 0; i <= moveIndex; i++) {
            const move = gameState[i];
            chess.move({ from: move.from, to: move.to, promotion: 'q' }); // Ensure to include promotion if necessary
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
        <div className="container mx-auto mt-8 px-4 lg:w-3/4">
            <h1 className="text-3xl font-bold mb-8 text-center text-teal-700">Game Details</h1>

            {/* Flex Container for Game State and Game Details */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

                {/* Game State (Left) */}
                <div className="flex flex-col justify-center align-center p-8 space-y-6 bg-gray-50 border-2 border-teal-600 rounded-lg">
                    {/* Player Information Section */}
                    <div className="flex flex-col space-y-4">
                        <div className="flex items-center space-x-4 text-xl font-semibold text-teal-700">
                            <FaUserAlt className="text-teal-600 text-2xl" />
                            <p><strong className='tex-gray-900'>White Player:</strong > {game.white_username}</p>
                        </div>

                        <div className="flex items-center space-x-4 text-xl font-semibold text-teal-700">
                            <FaUserAlt className="text-teal-600 text-2xl" />
                            <p><strong className='tex-gray-900'>Black Player:</strong> {game.black_username}</p>
                        </div>
                    </div>

                    {/* Game Stats Section */}
                    <div className="flex flex-col space-y-4">
                        <div className="flex items-center space-x-4 text-xl font-semibold text-teal-700">
                            <FaChessKnight className="text-teal-600 text-2xl" />
                            <p><strong className='tex-gray-900'>Moves:</strong> {JSON.parse(game.game_state).length}</p>
                        </div>
                    </div>

                    {/* Animated End Game Status */}
                    <div className="mt-6 flex justify-center items-center p-3 bg-teal-600 rounded-full text-white font-bold text-lg">
                        {game.winnerUsername ? (
                            <p>{game.winnerUsername} won the game!</p>
                        ) : (
                            <p>Game Ongoing...</p>
                        )}
                    </div>
                </div>



                {/* Chess Board (Right) */}
                <div className="flex justify-center col-span-2 bg-gray-50 border-2 border-teal-600 rounded-lg p-4">
                    <div className="grid grid-cols-8 grid-rows-8 gap-0 w-96 h-96">
                        {board.map((row, rowIndex) =>
                            row.map((square, squareIndex) => (
                                <div
                                    key={(rowIndex * 8 + squareIndex)}
                                    className={`w-full h-full flex items-center justify-center ${(rowIndex + squareIndex) % 2 === 0 ? "bg-teal-600" : "bg-teal-700"}`}
                                >
                                    <span
                                        className={`text-2xl ${square?.color === "w" ? "text-white" : "text-black"}`}
                                    >
                                        {getPieceUnicode(square)}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

            </div>

            {/* Game Moves Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                {JSON.parse(game.game_state).map((move, index) => (
                    <button
                        key={index}
                        onClick={() => handleMoveClick(index)}
                        className={`p-2 border-2 rounded-md transition-all transform ${selectedMoveIndex === index
                            ? 'bg-teal-600 text-white scale-105'
                            : 'bg-gray-200 text-gray-700'
                            } hover:scale-110 hover:bg-teal-700 hover:text-white`}
                    >
                        Move {index + 1}: {move.from} → {move.to}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default GameDetail;
