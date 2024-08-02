import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Chessboard } from 'react-chessboard';
import { Box, Card, CardContent, Typography, List, ListItem, ListItemText, ListSubheader } from '@mui/material';
import { Container } from '@mui/system';

const GameDetails = () => {
    const { gameId } = useParams();
    const [game, setGame] = useState(null);
    const [fen, setFen] = useState('start');

    useEffect(() => {
        const fetchGameDetails = async () => {
            try {
                const response = await axios.get(`http://localhost:3000/games/${gameId}`);
                if (response.data) {
                    setGame(response.data);
                }

                if (!response.data) {
                    const gameDetail = {
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
                    }
                    setGame(gameDetail)
                    setFen(gameDetail.moves[0].fen)
                }
            } catch (error) {
                console.error('Error fetching game details', error);
            }
        }

        fetchGameDetails();
    }, [gameId]);

    const handleMoveClick = (fen) => {
        setFen(fen);
    };

    return (
        <Container>
            {game && (
                <Card>
                    <CardContent>
                        <Typography variant="h5">Game Details</Typography>
                        <div style={{
                            maxWidth: 600,
                            maxHeight: 600,
                        }}><Chessboard position={fen} /></div>
                        <List>
                            <ListSubheader>Moves</ListSubheader>
                            {game.moves.map((move, index) => (
                                <ListItem button key={index} onClick={() => handleMoveClick(move.fen)}>
                                    <ListItemText primary={`Move ${index + 1}: ${move.move}`} />
                                </ListItem>
                            ))}
                        </List>
                    </CardContent>
                </Card>
            )}
        </Container>
    );
};

export default GameDetails;
