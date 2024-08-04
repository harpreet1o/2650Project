import sql from 'mssql';
import bcrypt from 'bcryptjs';
import config from '../config.js';

const dbConfig = {
  user: config.databaseUser,
  password: config.databasePassword,
  server: config.databaseServer,
  database: config.databaseName,
  options: {
    encrypt: true, // for Azure SQL Database
    trustServerCertificate: config.databaseTrustServerCertificate === 'yes',
  },
  connectionTimeout: parseInt(config.databaseConnectionTimeout, 10)
};

// Initialize Azure SQL Database connection
const poolPromise = sql.connect(dbConfig).then(pool => {
  console.log('Connected to Azure SQL Database');
  return pool;
}).catch(err => {
  console.error('Database connection failed: ', err);
});

// Function to find user by ID
const findUserById = async (id, cb) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.VarChar, id)
      .query('SELECT id, name, email FROM [user] WHERE id = @id');
    cb(null, result.recordset[0]);
  } catch (err) {
    cb(err, null);
  }
};

// Function to create a new user
const createUser = async ({ id, email, name, password }, cb) => {
  let hashedPassword = null;
  if (password) {
    const salt = bcrypt.genSaltSync(10);
    hashedPassword = bcrypt.hashSync(password, salt);
  }
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('id', sql.VarChar, id)
      .input('email', sql.VarChar, email)
      .input('name', sql.VarChar, name)
      .input('password', sql.VarChar, hashedPassword)
      .query('INSERT INTO [user] (id, email, name, password) VALUES (@id, @email, @name, @password)');
    cb(null, { id, email, name });
  } catch (err) {
    cb(err, null);
  }
};

// Function to find user by email
const findUserByEmail = async (email, cb) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('email', sql.VarChar, email)
      .query('SELECT id, name, email, password FROM [user] WHERE email = @email');
    cb(null, result.recordset[0]);
  } catch (err) {
    cb(err, null);
  }
};

// Function to compare passwords
const matchPassword = (password, hash) => bcrypt.compareSync(password, hash);

export { findUserById, createUser, findUserByEmail, matchPassword };
