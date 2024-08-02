import User from '../models/User.js';
import Game from '../models/Game.js';

// Helper function to update game stats
const updateGameStats = async (winnerId, loserId, gameId) => {
    try {
        const winner = await User.findById(winnerId);
        if (!winner) throw new Error('Winner not found');
        winner.gamesPlayed += 1;
        winner.gamesWon += 1;
        winner.games.push({ gameId, result: 'win', timestamp: new Date() });
        await winner.save();

        const loser = await User.findById(loserId);
        if (!loser) throw new Error('Loser not found');
        loser.gamesPlayed += 1;
        loser.games.push({ gameId, result: 'loss', timestamp: new Date() });
        await loser.save();

        console.log('Game stats updated successfully.');
    } catch (error) {
        console.error('Error updating game stats:', error);
    }
};

// Call this function whenever a game is completed
const onGameCompleted = async (winnerId, loserId) => {
    try {
        const winner = await User.findById(winnerId);
        const loser = await User.findById(loserId);

        if (!winner || !loser) {
            console.error('Invalid winner or loser ID');
            return;
        }

        const game = new Game({
            players: [
                { userId: winnerId, username: winner.name },
                { userId: loserId, username: loser.name }
            ],
            result: 'win',
            winner: winnerId,
            timestamp: new Date()
        });

        const savedGame = await game.save();
        await updateGameStats(winnerId, loserId, savedGame._id);
    } catch (error) {
        console.error('Error saving game:', error);
    }
};

export default onGameCompleted