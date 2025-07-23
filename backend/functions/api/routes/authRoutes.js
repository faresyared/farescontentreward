const express = require('express');
console.log('authRoutes.js: File loaded');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/userModel');
const passport = require('../middleware/passport');
const router = express.Router();

// --- CHANGE 1: Import validation tools ---
const { body, validationResult } = require('express-validator');

// --- CHANGE 2: Add validation rules to the signup route ---
router.post('/signup',
  [ // This array holds all our validation rules
    body('fullName', 'Full name is required').not().isEmpty().trim().escape(),
    body('username', 'Username is required').not().isEmpty().trim().escape(),
    body('email', 'Please include a valid email').isEmail().normalizeEmail(),
    body('password', 'Password must be at least 6 characters').isLength({ min: 6 })
  ],
  async (req, res) => {
    // --- CHANGE 3: Check for validation errors ---
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // If there are errors, send a 400 Bad Request response with the errors
      return res.status(400).json({ errors: errors.array() });
    }

    // If validation passes, the original logic runs
    const { username, fullName, email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: 'User with this email already exists.' });
        user = await User.findOne({ username });
        if (user) return res.status(400).json({ message: 'This username is already taken.' });
        user = new User({ username, fullName, email, password });
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();
        
        const payload = { user: { id: user.id, role: user.role, username: user.username, avatar: user.avatar } };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' });
        res.status(201).json({ token });
    } catch (err) { console.error(err); res.status(500).send('Server error'); }
});

// ... (The rest of the file remains the same)
router.post('/signin', async (req, res) => {
    const { login, password } = req.body;
    try {
        const user = await User.findOne({ $or: [{ email: login }, { username: login }] });
        if (!user) return res.status(400).json({ message: 'Invalid credentials.' });
        if (!user.password) return res.status(400).json({ message: 'Please sign in with Google.' });
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials.' });
        
        const payload = { user: { id: user.id, role: user.role, username: user.username, avatar: user.avatar } };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' });
        res.json({ token });
    } catch (err) { console.error(err); res.status(500).send('Server error'); }
});
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/', session: false }), (req, res) => {
    const user = req.user;
    const payload = { user: { id: user.id, role: user.role, username: user.username, avatar: user.avatar } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' });
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
});
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