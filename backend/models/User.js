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
      id INTEGER PRIMARY KEY,
      email TEXT UNIQUE,
      name TEXT,
      password TEXT
    )`);
  }
});



const findUserById = (id, cb) => {
  db.get('SELECT name FROM user WHERE id = ?', [id], (err, row) => {
    cb(err, row);
  });
};


const createUser = ({ id, email, name, password }, cb) => {

  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = password ? bcrypt.hashSync(password, salt) : null;
  db.run(
    'INSERT INTO user (id, email, name, password) VALUES (?, ?, ?, ?)',
    [id, email, name, hashedPassword],
    function (err) {
      cb(err, { id,password, email, name });
    }
  );
};

const matchPassword = (password, hash) => bcrypt.compareSync(password, hash);

export { db,  findUserById, createUser };
