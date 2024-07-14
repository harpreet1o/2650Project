// models/User.js

import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  googleId: {
    type: String,
    required: true,
    unique: true
  },
  username: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String
  }
});

const User = mongoose.model('User', userSchema);

export default User;
