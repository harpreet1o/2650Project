// routes/auth.js
import express from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { createUser, findUserByEmail, matchPassword, findUserById } from '../models/User.js';

const secretKeyJWT = "asdasdsadasdasdasdsa";

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: 'http://localhost:3000/oauth2/redirect/google', // Ensure this matches your route
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
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, secretKeyJWT, { expiresIn: '24h' });
};

// Middleware to authenticate the JWT token
const authenticateJWT = (req, res, next) => {
  const token = req.cookies.token;

  if (token) {
    jwt.verify(token, secretKeyJWT, (err, decoded) => {
      if (err) {
        return res.sendStatus(403);
      }
      req.user = decoded;
      next();
    });
  } else {
    res.sendStatus(401);
  }
};

// User registration route
router.post('/register', (req, res) => {
  const { email, name, password } = req.body;

  findUserByEmail(email, (err, existingUser) => {
    if (err) {
      return res.status(500).json({ message: 'Internal server error.' });
    }
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists.' });
    }

    const newUser = {
      id: uuidv4(),
      email,
      name,
      password
    };

    createUser(newUser, (err, user) => {
      if (err) {
        return res.status(500).json({ message: 'Internal server error.' });
      }
      const token = generateToken(user.id);
      res.cookie('token', token, { httpOnly: true, secure: true, sameSite: "none" });
      res.status(201).json({ message:"created succesfully"});
    });
  });
});

// User login route
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  findUserByEmail(email, (err, user) => {
    if (err) {
      return res.status(500).json({ message: 'Internal server error.' });
    }
    if (!user || !matchPassword(password, user.password)) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = generateToken(user.id);
    res.cookie('token', token, { httpOnly: true, secure: true, sameSite: "none" });
    res.json({ user, token });
  });
});

router.get('/login/federated/google', (req, res, next) => {
  if (req.cookies && req.cookies.token) {
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
          res.redirect(`http://localhost:5173`);
        }
        return next();
      });
    });
  } else {
    passport.authenticate('google')(req, res, next);
  }
});

router.get('/oauth2/redirect/google', passport.authenticate('google', {
  session: false,
  failureRedirect: 'http://localhost:5173/login'
}), (req, res) => {
  const token = generateToken(req.user.id);
  res.cookie('token', token, { httpOnly: true, secure: true, sameSite: "none" });
  res.redirect(`http://localhost:5173`);
});

router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.redirect('/');
});

// Route to get current user
router.get('/current_user', authenticateJWT, (req, res) => {
  findUserById(req.user.id, (err, user) => {
    if (err) {
      return res.status(500).json({ message: 'Internal server error.' });
    }
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.json({ username: user.name });
  });
});

export default router;
