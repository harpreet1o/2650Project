import mongoose from 'mongoose';

const moveSchema = new mongoose.Schema({
    move: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});

const playerSchema = new mongoose.Schema({
    userId: { type: String, ref: 'User', required: true },
    username: { type: String, required: true }
});

const gameSchema = new mongoose.Schema({
    players: [playerSchema],
    moves: [moveSchema],
    result: { type: String, enum: ['win', 'loss', 'draw'], required: true },
    winner: { type: String, ref: 'User', default: null },
    timestamp: { type: Date, default: Date.now }
});

const Game = mongoose.model('Game', gameSchema);

export default Game;
