import express from 'express';
import User from '../models/User.js';
import isAuthenticated from '../middleware/auth.js'; // Middleware to check if user is authenticated

const router = express.Router();

router.get('/profile', isAuthenticated, async (req, res) => {
    try {
        const userId = req.user._id; // Assuming user ID is stored in req.user
        const user = await User.findById(userId).select('name email gamesPlayed gamesWon');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

export default router;
