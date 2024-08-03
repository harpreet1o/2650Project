import sqlite3 from 'sqlite3';

// Initialize SQLite database
const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database.');
    db.run(`CREATE TABLE IF NOT EXISTS game_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      white_player TEXT,
      black_player TEXT,
      winner TEXT,
      loser TEXT,
      game_state TEXT
    )`);
  }
});

// Function to save game result
const saveGameResult = (whitePlayer, blackPlayer, winner, loser, gameState, cb) => {
  db.run(
    'INSERT INTO game_history (white_player, black_player, winner, loser, game_state) VALUES (?, ?, ?, ?, ?)',
    [whitePlayer, blackPlayer, winner, loser, gameState],
    (err) => {
      if (err) {
        console.error('Error saving game result:', err.message);
        cb(err);
      } else {
        console.log('Game result saved.');
        cb(null);
      }
    }
  );
};

// Function to get all game histories
const getAllGameHistories = (cb) => {
  db.all('SELECT * FROM game_history', [], (err, rows) => {
    if (err) {
      console.error('Error fetching game histories:', err.message);
      cb(err, null);
    } else {
      cb(null, rows);
    }
  });
};

// Function to get a game history by ID
const getGameHistoryById = (id, cb) => {
  db.get('SELECT * FROM game_history WHERE id = ?', [id], (err, row) => {
    if (err) {
      console.error('Error fetching game history:', err.message);
      cb(err, null);
    } else {
      cb(null, row);
    }
  });
};

export { db, saveGameResult, getAllGameHistories, getGameHistoryById };
