// db.js
import "dotenv/config"
import mongoose from 'mongoose'

const mongoURI = process.env.MONGOURI; // Replace with your MongoDB URI

mongoose.connect(mongoURI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB connection error:', err));

export default mongoose;
