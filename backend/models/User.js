import mysql from 'mysql2';
import bcrypt from 'bcryptjs';
import config from '../config.js';

// MySQL Database configuration
const dbConfig = {
  host: config.databaseServer,
  user: config.databaseUser,
  password: config.databasePassword,
  database: config.databaseName,
  connectionLimit: 10, // Set the connection pool limit
  charset: 'utf8mb4',  // Ensure compatibility with UTF-8 characters
};

// Initialize MySQL Database connection pool
const pool = mysql.createPool(dbConfig);

// Function to find user by ID
const findUserById = (id, cb) => {
  pool.execute('SELECT id, name, email FROM `user` WHERE id = ?', [id], (err, result) => {
    if (err) return cb(err, null);
    cb(null, result[0]);
  });
};

// Function to create a new user
const createUser = async ({ id, email, name, password }, cb) => {
  let hashedPassword = null;
  if (password) {
    const salt = bcrypt.genSaltSync(10);
    hashedPassword = bcrypt.hashSync(password, salt);
  }

  pool.execute(
    'INSERT INTO `user` (id, email, name, password) VALUES (?, ?, ?, ?)',
    [id, email, name, hashedPassword],
    (err, result) => {
      if (err) return cb(err, null);
      cb(null, { id, email, name });
    }
  );
};

// Function to find user by email
const findUserByEmail = (email, cb) => {
  pool.execute('SELECT id, name, email, password FROM `user` WHERE email = ?', [email], (err, result) => {
    if (err) return cb(err, null);
    cb(null, result[0]);
  });
};

// Function to compare passwords
const matchPassword = (password, hash) => bcrypt.compareSync(password, hash);

export { findUserById, createUser, findUserByEmail, matchPassword };
