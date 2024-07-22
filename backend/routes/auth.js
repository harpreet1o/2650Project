import express from 'express';
import passport from 'passport';
import GoogleStrategy from 'passport-google-oidc';
import LocalStrategy from 'passport-local';
import User from '../models/User.js';

// Configure the Google strategy for use by Passport.

passport.use(new GoogleStrategy({
    clientID: process.env['GOOGLE_CLIENT_ID'],
    clientSecret: process.env['GOOGLE_CLIENT_SECRET'],
    callbackURL: '/oauth2/redirect/google',
    scope: ['profile', 'email']
}, async function verify(issuer, profile, cb) {


    // Check if user exists in MongoDB
    console.log("profile: ", profile)
    const newUser = {
        googleId: profile.id,
        email: profile.emails[0].value,
        name: profile.displayName
    };

    try {
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
            return cb(null, user);
        } else {
            user = new User(newUser);
            await user.save();
            return cb(null, user);
        }
    } catch (err) {
        console.error(err);
        return cb(err, null);
    }
}));

// configure the local strategy for passport for user login
passport.use(
    new LocalStrategy(
        { usernameField: 'email' },
        async (email, password, done) => {
            try {
                let user = await User.findOne({ email });

                if (!user) {
                    return done(null, false, { message: 'Invalid credentials' });
                }

                const isMatch = await user.matchPassword(password);

                if (!isMatch) {
                    return done(null, false, { message: 'Invalid credentials' });
                }

                return done(null, user);
            } catch (err) {
                console.error(err);
                return done(err, null);
            }
        }
    )
);

// Configure Passport authenticated session persistence.

passport.serializeUser(function (user, cb) {
    process.nextTick(function () {
        cb(null, user.id);
    });
});

passport.deserializeUser(async function (id, cb) {
    try {
        const user = await User.findById(id);
        cb(null, user);
    } catch (err) {
        cb(err, null);
    }
});


var router = express.Router();


/* GET /login/federated/accounts.google.com
 *
 * This route redirects the user to Google, where they will authenticate.
 * redirected back to the app at `GET /oauth2/redirect/accounts.google.com`.
 */
router.get('/login/federated/google', passport.authenticate('google'));

router.get('/oauth2/redirect/google', passport.authenticate('google', {
    successReturnToOrRedirect: 'http://localhost:5173/',
    failureRedirect: 'http://localhost:5173/'
}));

/*
 * This route logs the user out.
 */
router.get('/logout', function (req, res, next) {
    req.logout(function (err) {
        if (err) { return next(err); }
        res.redirect('/');
    });
});

// Register route
router.post('/register', async (req, res) => {
    const { email, name, password } = req.body;
    console.log(email)
    try {
        let user = await User.findOne({ email });

        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        user = new User({ email, name, password });
        await user.save();

        req.login(user, (err) => {
            if (err) {
                return res.status(500).send(err);
            }
            return res.status(201).json(user);
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// Login route
router.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.status(400).json({ msg: info.message });
        }
        req.login(user, (err) => {
            if (err) {
                return next(err);
            }
            return res.json(user);
        });
    })(req, res, next);
});


// Route to get current user
router.get('/current_user', (req, res) => {
    res.send(req.user);
});

export default router
