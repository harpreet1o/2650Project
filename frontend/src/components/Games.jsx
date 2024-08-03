// src/components/Games.js
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Games = () => {
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchGames = async () => {
            try {
                const response = await axios.get('http://localhost:3000/user/games', { withCredentials: true });
                setGames(response.data);
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


    if (loading) {
        return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div></div>;
    }

    if (error) {
        return <div className="text-center text-red-500">{error}</div>;
    }

    return (
        <div className="container mx-auto mt-8">
            <h1 className="text-2xl font-bold mb-6">Games Played</h1>
            <ul>
                {games.map((game) => (
                    <li key={game.id} className="border-b border-gray-200 py-2">
                        <div
                            onClick={() => handleGameClick(game)}
                            className="cursor-pointer text-blue-500 hover:underline"
                        >
                            Game on {new Date(game.timestamp).toLocaleString()}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Games;
