import mysql from 'mysql2/promise';
import config from '../config.js';

// MySQL Database configuration
const dbConfig = {
  host: config.databaseHost,
  user: config.databaseUser,
  password: config.databasePassword,
  database: config.databaseName,
  connectionLimit: 10, // Set the connection pool limit
  charset: 'utf8mb4',  // Ensure compatibility with UTF-8 characters
};

// Create MySQL connection pool
const poolPromise = mysql.createPool(dbConfig);

// Function to save game result
const saveGameResult = async (whitePlayer, blackPlayer, winner, loser, gameState, cb) => {
  try {
    const connection = await poolPromise.getConnection();
    const [result] = await connection.execute(
      'INSERT INTO game_history (white_player, black_player, winner, loser, game_state) VALUES (?, ?, ?, ?, ?)', 
      [whitePlayer, blackPlayer, winner, loser, gameState]
    );
    connection.release(); // Don't forget to release the connection back to the pool
    cb(null);
  } catch (err) {
    console.error('Error saving game result:', err.message);
    cb(err);
  }
};

// Function to get all game histories
const getAllGameHistories = async (cb) => {
  try {
    const connection = await poolPromise.getConnection();
    const [result] = await connection.execute('SELECT * FROM game_history');
    connection.release();
    cb(null, result);
  } catch (err) {
    console.error('Error fetching game histories:', err.message);
    cb(err, null);
  }
};

// Function to get a game history by ID
const getGameHistoryById = async (id, cb) => {
  try {
    const connection = await poolPromise.getConnection();
    const [result] = await connection.execute('SELECT * FROM game_history WHERE id = ?', [id]);
    connection.release();
    cb(null, result[0]);
  } catch (err) {
    console.error('Error fetching game history by ID:', err.message);
    cb(err, null);
  }
};

// Function to get games by user ID
const getGamesByUserId = async (userId, cb) => {
  try {
    const connection = await poolPromise.getConnection();
    const [result] = await connection.execute(`
      SELECT gh.*, wu.name AS white_username, bu.name AS black_username
      FROM game_history gh
      LEFT JOIN user wu ON gh.white_player = wu.id
      LEFT JOIN user bu ON gh.black_player = bu.id
      WHERE gh.white_player = ? OR gh.black_player = ?
    `, [userId, userId]);
    connection.release();
    cb(null, result);
  } catch (err) {
    console.error('Error fetching games for user:', err.message);
    cb(err, null);
  }
};

export { saveGameResult, getAllGameHistories, getGameHistoryById, getGamesByUserId };
