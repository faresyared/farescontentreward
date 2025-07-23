const express = require('express');
console.log('userRoutes.js: File loaded');

const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const Campaign = require('../models/campaignModel');
const Transaction = require('../models/transactionModel');
const { auth } = require('../middleware/auth');
const router = express.Router();

// GET the logged-in user's profile
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// UPDATE the logged-in user's profile
router.put('/me', auth, async (req, res) => {
    const { fullName, email, avatar } = req.body;
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        
        user.fullName = fullName || user.fullName;
        user.email = email || user.email;
        user.avatar = avatar || user.avatar;
        
        await user.save();
        
        const payload = {
            user: { id: user.id, role: user.role, username: user.username, avatar: user.avatar }
        };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' });

        res.json({ token });

    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// GET joined campaigns for the logged-in user
router.get('/me/joined', auth, async (req, res) => {
    try {
        const campaigns = await Campaign.find({ participants: req.user.id }).sort({ name: 1 });
        res.json(campaigns);
    } catch (err) {
        console.error("Error fetching joined campaigns:", err);
        res.status(500).send('Server Error');
    }
});

// GET transactions for the logged-in user
router.get('/me/transactions', auth, async (req, res) => {
    try {
        const transactions = await Transaction.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json(transactions);
    } catch (err) {
        console.error("Error fetching transactions:", err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;