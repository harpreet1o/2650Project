import express from 'express';
import Game from '../models/Game.js';

const router = express.Router();

// Endpoint to get the details of a specific game
router.get('/:gameId', async (req, res) => {
    try {
        const gameId = req.params.gameId;
        const game = await Game.findById(gameId);
        if (!game) {
            return res.status(404).json({ message: 'Game not found' });
        }
        res.json(game);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

export default router;
