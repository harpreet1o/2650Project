import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Typography, Paper, CircularProgress, Grid, Card, CardContent, CardHeader, List, ListItem, ListItemText } from '@mui/material';
import { Link } from 'react-router-dom';

const UserProfile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [games, setGames] = useState([
        {
          "gameId": {
            "_id": "60d21b9667d0d8992e610c85",
            "players": [
              {
                "userId": "60d21b4667d0d8992e610c83",
                "username": "Player1"
              },
              {
                "userId": "60d21b5367d0d8992e610c84",
                "username": "Player2"
              }
            ],
            "moves": [
              {
                "move": "e4",
                "fen": "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1",
                "timestamp": "2023-07-22T12:00:00Z"
              },
              {
                "move": "e5",
                "fen": "rnbqkbnr/pppppppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2",
                "timestamp": "2023-07-22T12:02:00Z"
              }
            ],
            "result": "win",
            "winner": "60d21b4667d0d8992e610c83",
            "timestamp": "2023-07-22T12:30:00Z"
          },
          "result": "win",
          "timestamp": "2023-07-22T12:30:00Z"
        },
        {
          "gameId": {
            "_id": "60d21c2f67d0d8992e610c86",
            "players": [
              {
                "userId": "60d21b4667d0d8992e610c83",
                "username": "Player1"
              },
              {
                "userId": "60d21b5367d0d8992e610c84",
                "username": "Player2"
              }
            ],
            "moves": [
              {
                "move": "d4",
                "fen": "rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq - 0 1",
                "timestamp": "2023-07-23T14:00:00Z"
              },
              {
                "move": "d5",
                "fen": "rnbqkbnr/pppppppp/8/3p4/3P4/8/PPP1PPPP/RNBQKBNR w KQkq d6 0 2",
                "timestamp": "2023-07-23T14:02:00Z"
              }
            ],
            "result": "loss",
            "winner": "60d21b5367d0d8992e610c84",
            "timestamp": "2023-07-23T14:30:00Z"
          },
          "result": "loss",
          "timestamp": "2023-07-23T14:30:00Z"
        }
      ]
      );

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await axios.get('http://localhost:3000/user/profile', { withCredentials: true });
                setProfile(response.data);
                setLoading(false);
            } catch (err) {
                setError(err.response ? err.response.data.message : 'Error fetching profile');
                setLoading(false);
            }
        };
        const fetchGames = async () => {
            try {
                const response = await axios.get('http://localhost:3000/user/profile/games');
                setGames(response.data);
            } catch (error) {
                console.error('Error fetching games', error);
            }
        };


        fetchProfile();
        // fetchGames();
    }, []);
    if (loading) {
        return <CircularProgress />;
    }

    if (error) {
        return <Typography color="error">{error}</Typography>;
    }

    return (
        <div>
            <div className="flex justify-center items-center mt-4">
                <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
                    <div className="flex items-center space-x-4 mb-6">
                        <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl">
                            {profile.name.charAt(0)}
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold">{profile.name}</h2>
                            <p className="text-gray-600">{profile.email}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                            <h3 className="text-gray-600">Games Played</h3>
                            <p className="text-2xl font-bold">{profile.gamesPlayed}</p>
                        </div>
                        <div className="text-center">
                            <h3 className="text-gray-600">Games Won</h3>
                            <p className="text-2xl font-bold">{profile.gamesWon}</p>
                        </div>
                    </div>
                </div>
            </div>
            <div>
                <Card>
                    <CardContent>
                        <Typography variant="h5">Games Played</Typography>
                        <List>
                            {games.map((game) => (
                                <ListItem key={game.gameId._id} button component={Link} to={`/game/${game.gameId._id}`}>
                                    <ListItemText primary={`Game on ${new Date(game.timestamp).toLocaleString()}`} />
                                </ListItem>
                            ))}
                        </List>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default UserProfile;