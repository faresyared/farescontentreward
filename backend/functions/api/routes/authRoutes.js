const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/userModel');
const passport = require('../middleware/passport');
const router = express.Router();
const { body, validationResult } = require('express-validator');

// A helper function to create the JWT payload
const createTokenPayload = (user) => {
  return {
    user: {
      id: user.id,
      role: user.role,
      username: user.username,
      avatar: user.avatar,
      isVerified: user.isVerified // IMPORTANT: Include verification status
    }
  };
};

// --- UPDATED SIGNUP ROUTE ---
router.post('/signup',
  [
    body('fullName', 'Full name is required').not().isEmpty().trim().escape(),
    body('username', 'Username is required').not().isEmpty().trim().escape(),
    body('email', 'Please include a valid email').isEmail().normalizeEmail(),
    body('password', 'Password must be at least 6 characters').isLength({ min: 6 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, fullName, email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User with this email already exists.' });
        }

        const verificationToken = crypto.randomBytes(32).toString('hex');
        
        user = new User({ username, fullName, email, password, verificationToken });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();
        
        // --- FIX 1: The verification URL now points to the backend API ---
        const verificationUrl = `${process.env.FRONTEND_URL}/api/auth/verify-email/${verificationToken}`;
        
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
        });
        const mailOptions = {
            to: user.email,
            from: `Reelify Support <${process.env.EMAIL_USER}>`,
            subject: 'Please Verify Your Reelify Account',
            text: `Thank you for signing up! Please click the following link to verify your email address:\n\n${verificationUrl}\n\nIf you did not create an account, please ignore this email.\n`
        };
        await transporter.sendMail(mailOptions);

        // --- FIX 2: Log the user in immediately after signup ---
        const payload = createTokenPayload(user);
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' });
        res.status(201).json({ token });

    } catch (err) { console.error(err); res.status(500).send('Server error'); }
});

// --- NEW VERIFICATION ROUTE (Works correctly now) ---
router.get('/verify-email/:token', async (req, res) => {
    try {
        const user = await User.findOne({ verificationToken: req.params.token });
        if (!user) {
            return res.status(400).send('Verification link is invalid or has expired.');
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        await user.save();

        const payload = createTokenPayload(user);
        const jwtToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' });
        
        res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${jwtToken}`);

    } catch (err) {
        console.error(err);
        res.status(500).send('Server error. Could not verify account.');
    }
});

// --- UPDATED SIGNIN ROUTE ---
router.post('/signin', async (req, res) => {
    const { login, password } = req.body;
    try {
        const user = await User.findOne({ $or: [{ email: login }, { username: login }] });
        if (!user) return res.status(400).json({ message: 'Invalid credentials.' });

        // --- FIX 3: REMOVED the verification check. Unverified users can now log in. ---

        if (!user.password) return res.status(400).json({ message: 'Please sign in with Google.' });
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials.' });
        
        const payload = createTokenPayload(user);
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' });
        res.json({ token });
    } catch (err) { console.error(err); res.status(500).send('Server error'); }
});

// --- UPDATED GOOGLE ROUTE ---
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/', session: false }), async (req, res) => {
    const user = req.user;
    user.isVerified = true; // Google users are automatically verified
    await user.save();
    
    const payload = createTokenPayload(user);
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' });
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
});

// ... (Password reset routes are unchanged)
router.post('/forgot-password', async (req, res) => {
    try {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const user = await User.findOne({ email: req.body.email });
        if (!user) return res.status(404).json({ message: 'No user with that email exists.' });
        user.passwordResetToken = code;
        user.passwordResetExpires = Date.now() + 600000;
        await user.save();
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
        });
        const mailOptions = {
            to: user.email,
            from: `Reelify Support <${process.env.EMAIL_USER}>`,
            subject: 'Your Reelify Password Reset Code',
            text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n` +
                  `Your password reset code is: ${code}\n\n` +
                  `This code will expire in 10 minutes.\n\n` +
                  `If you did not request this, please ignore this email and your password will remain unchanged.\n`
        };
        await transporter.sendMail(mailOptions);
        res.json({ message: 'A password reset code has been sent to your email.' });
    } catch (err) { console.error(err); res.status(500).send('Server error'); }
});
router.post('/reset-password', async (req, res) => {
    try {
        const { email, code, password } = req.body;
        const user = await User.findOne({
            email: email,
            passwordResetToken: code,
            passwordResetExpires: { $gt: Date.now() }
        });
        if (!user) {
            return res.status(400).json({ message: 'Reset code is invalid or has expired.' });
        }
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();
        res.json({ message: 'Password has been updated successfully.' });
    } catch (err) { console.error(err); res.status(500).send('Server error'); }
});

module.exports = router;