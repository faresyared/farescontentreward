const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/userModel');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/api/auth/google/callback' // This path must match your route
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await User.findOne({ googleId: profile.id });
        if (user) { return done(null, user); }

        user = await User.findOne({ email: profile.emails[0].value });
        if (user) {
            user.googleId = profile.id;
            await user.save();
            return done(null, user);
        }

        const newUser = new User({
            googleId: profile.id,
            username: profile.displayName.replace(/\s+/g, '').toLowerCase() + Math.random().toString(36).substring(2, 6),
            fullName: profile.displayName,
            email: profile.emails[0].value,
            avatar: profile.photos[0].value,
        });
        await newUser.save();
        done(null, newUser);
    } catch (err) { done(err, null); }
  }
));

module.exports = passport;