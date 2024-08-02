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
  callbackURL: 'http://localhost:3000/oauth2/redirect/google', // Ensure this matches your route
  scope: ['profile', 'email', 'openid']
}, (accessToken, refreshToken, profile, cb) => {
    console.log(profile.id);
  const newUser = {
    id: profile.id,
    email: profile.emails[0].value,
    name: profile.displayName,
  };

 

    createUser(newUser, (err, user) => {
      if (err) return cb(err);
      return cb(null, user);
    })
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
  return jwt.sign({ id: user.id }, secretKeyJWT, { expiresIn: '1h' });
};

router.get('/login/federated/google',()=>{
    if(req.cookies.token){
        const decoded=jwt.verify(token, secretKeyJWT);
     res.send(decoded.id);
    }
     else passport.authenticate('google')
    });

router.get('/oauth2/redirect/google', passport.authenticate('google', {
    session: false,
    failureRedirect: 'http://localhost:5173/login'
  }), (req, res) => {
    const token = generateToken(req.user);
    res.cookie('token', token, { httpOnly: true, secure: true, sameSite: "none" });
    res.redirect('http://localhost:5173/');
  });

router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.redirect('/');
});

export default router;
