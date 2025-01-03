// src/components/Games.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaTrophy, FaChess, FaUser, FaClock, FaExclamationCircle, FaSpinner } from 'react-icons/fa';


const Games = () => {
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchGames = async () => {
            try {
                const response = await axios.get('http://localhost:3000/user/games', { withCredentials: true });
                const games = response.data;
                setGames(games.map(game => {return {...game, ...getWinnerAndLoser(game)}}));
                setLoading(false);
            } catch (error) {
                setError('Error fetching games');
                setLoading(false);
            }
        };

        fetchGames();
    }, []);

    const handleGameClick = (game) => {
        navigate(`/game/${game.id}`, { state: { game } });
    };

    const getWinnerAndLoser = (game) => {
        const winnerUsername = game.white_player === game.winner ? game.white_username : game.black_username;
        const loserUsername = game.white_player !== game.winner ? game.white_username : game.black_username;
        
        return { winnerUsername, loserUsername };
      };
    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <FaSpinner className="animate-spin text-teal-600 text-6xl" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-screen">
                <FaExclamationCircle className="text-red-500 text-4xl" />
                <p className="ml-4 text-xl text-red-600">{error}</p>
            </div>
        );
    }
    return (
        <div className="container mx-auto px-6 py-12">
            <h1 className="text-4xl font-bold text-center text-teal-700 mb-10 flex items-center justify-center gap-3">
                <FaChess className="text-teal-600" />
                Games Played
            </h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {games
                    .filter((game) => JSON.parse(game.game_state).length > 0)
                    .map((game) => (
                        <div
                            key={game.id}
                            onClick={() => handleGameClick(game)}
                            className="relative rounded-lg shadow-lg p-6 border border-gray-200 bg-gradient-to-b from-white to-gray-50 hover:shadow-2xl transform hover:scale-105 transition duration-300 cursor-pointer"
                        >
                            {/* Card Header */}
                            <div className="absolute -top-4 -left-4 bg-teal-600 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-md">
                                <FaTrophy />
                            </div>
                            <h2 className="text-lg font-bold text-gray-800 mb-4">{game.white_username} <span className='text-teal-700'>v/s</span> {game.black_username}</h2>

                            {/* Game Image */}
                            <div className="flex justify-center">
                                <img
                                    src="https://upload.wikimedia.org/wikipedia/commons/5/56/Xboard_4.2.7_on_KDE_4.2.2_and_Fedora_10.png"
                                    alt="Chess Game Board"
                                    className="rounded-md border border-gray-300 w-72 h-72 object-cover"
                                />
                            </div>

                            {/* Game Stats */}
                            <div className="mt-4 space-y-3">
                                <div className="flex items-center text-green-700">
                                    <FaTrophy className="mr-2" />
                                    <span>
                                        <strong>Winner:</strong> {game.winnerUsername}
                                    </span>
                                </div>
                                <div className="flex items-center text-gray-900">
                                    <FaUser className="mr-2" />
                                    <span>
                                        <strong>Loser:</strong> {game.loserUsername}
                                    </span>
                                </div>
                                <div className="flex items-center text-gray-700">
                                    <FaClock className="mr-2" />
                                    <span>
                                        <strong>Duration:</strong> {JSON.parse(game.game_state).length} moves
                                    </span>
                                </div>
                            </div>

                            {/* Click Details */}
                            <button className="absolute bottom-4 right-4 bg-teal-700 text-white py-2 px-4 rounded-lg hover:bg-teal-600 transition">
                                View Details
                            </button>
                        </div>
                    ))}
            </div>
        </div>
    );
};

export default Games;
