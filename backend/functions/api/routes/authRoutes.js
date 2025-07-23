const express = require('express');
console.log('authRoutes.js: File loaded');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/userModel');
const passport = require('../middleware/passport');
const router = express.Router();

// Signup
router.post('/signup', async (req, res) => {
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

// Signin
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

// Google Auth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));

// Google Auth Callback
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/', session: false }), (req, res) => {
    const user = req.user;
    const payload = { user: { id: user.id, role: user.role, username: user.username, avatar: user.avatar } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' });
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
});

// --- CHANGE 1: FORGOT PASSWORD LOGIC ---
// Now generates a 6-digit code instead of a long token.
router.post('/forgot-password', async (req, res) => {
    try {
        // Generate a 6-digit code
        const code = Math.floor(100000 + Math.random() * 900000).toString();

        const user = await User.findOne({ email: req.body.email });
        if (!user) return res.status(404).json({ message: 'No user with that email exists.' });

        user.passwordResetToken = code; // Save the code
        user.passwordResetExpires = Date.now() + 600000; // 10 minutes
        await user.save();

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
        });
        
        // Update the email text to send the code
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

// --- CHANGE 2: RESET PASSWORD LOGIC ---
// Now expects email, code, and new password in the body.
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

module.exports = router;