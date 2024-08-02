// routes/auth.js
import express from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import jwt from 'jsonwebtoken';
import { createUser, findUserById } from '../models/User.js';

const secretKeyJWT = "asdasdsadasdasdasdsa";

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: 'http://localhost:3000/auth/oauth2/redirect/google', // Ensure this matches your route
  scope: ['profile', 'email', 'openid']
}, (accessToken, refreshToken, profile, cb) => {
  const newUser = {
    id: profile.id,
    email: profile.emails[0].value,
    name: profile.displayName,
  };

  createUser(newUser, (err, user) => {
    if (err && err.message.includes('UNIQUE constraint failed')) {
      // User already exists
      findUserById(profile.id, (err, existingUser) => {
        if (err) return cb(err);
        return cb(null, existingUser);
      });
    } else if (err) {
      return cb(err);
    } else {
      return cb(null, user);
    }
  });
}));

passport.serializeUser((user, cb) => {
  process.nextTick(() => {
    cb(null, user.id);
  });
});

passport.deserializeUser((id, cb) => {
  findUserById(id, (err, user) => {
    cb(err, user);
  });
});

const router = express.Router();

// Utility function to generate JWT
const generateToken = (user) => {
  return jwt.sign({ id: user.id }, secretKeyJWT, { expiresIn: '24h' });
};

router.get('/login/federated/google', (req, res, next) => {
  if (req.cookies.token) {
    const token = req.cookies.token;
    jwt.verify(token, secretKeyJWT, (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: 'Failed to authenticate token.' });
      }
      findUserById(decoded.id, (err, user) => {
        if (err) {
          return res.status(500).json({ message: 'Internal server error.' });
        }
        if (user) {
          return res.json({ message: 'User is already authenticated', user });
        }
        return next();
      });
    });
  } else {
    passport.authenticate('google')(req, res, next);
  }
});

router.get('/auth/oauth2/redirect/google', passport.authenticate('google', {
  session: false,
  failureRedirect: 'http://localhost:5173/login'
}), (req, res) => {
  const token = generateToken(req.user);
  res.cookie('token', token, { httpOnly: true, secure: true, sameSite: "none" });
  res.json({ token, user: req.user });
});

router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.redirect('/');
});

export default router;
