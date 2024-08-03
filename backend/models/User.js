// models/User.js
import sqlite3 from 'sqlite3';
import bcrypt from 'bcryptjs';

// Initialize SQLite database
const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database.');
    db.run(`CREATE TABLE IF NOT EXISTS user (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE,
      name TEXT,
      password TEXT
    )`);
    
  }
});

const findUserById = (id, cb) => {
  db.get('SELECT id, name, email FROM user WHERE id = ?', [id], (err, row) => {
    cb(err, row);
  });
};

const createUser = ({ id, email, name, password }, cb) => {
  let hashedPassword = null;
  if (password) {
    const salt = bcrypt.genSaltSync(10);
    hashedPassword = bcrypt.hashSync(password, salt);
  }
  db.run(
    'INSERT INTO user (id, email, name, password) VALUES (?, ?, ?, ?)',
    [id, email, name, hashedPassword],
    function (err) {
      cb(err, { id, email, name });
    }
  );
};
const findUserByEmail = (email, cb) => {
  db.get('SELECT id, name, email, password FROM user WHERE email = ?', [email], (err, row) => {
    cb(err, row);
  });
};
const matchPassword = (password, hash) => bcrypt.compareSync(password, hash);

export { db, findUserById, createUser,findUserByEmail,matchPassword };
