// backend/localServer.js

// This file now mirrors the structure of the serverless function for consistent testing.
// --- IMPORTS ---
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const dotenv = require('dotenv');

// --- CONFIGURATION ---
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3001;
app.use(cors());
app.use(express.json());

// --- DATABASE CONNECTION ---
const connectDB = async () => { /* ... same as index.js ... */ };
connectDB();

// --- MONGOOSE SCHEMAS ---
const User = require('./models/User'); // We can still use models locally
const Campaign = require('./models/Campaign');

// --- MIDDLEWARE ---
const auth = require('./middleware/auth');
const adminAuth = async (req, res, next) => {
    const user = await User.findById(req.user.id);
    if(user.role !== 'admin') return res.status(403).json({msg: 'Admin resource. Access denied.'});
    next();
};

// --- ROUTES ---
const router = express.Router();

// Auth routes
router.post('/users/signup', async (req, res) => { /* ... copy from index.js ... */ });
router.post('/users/signin', async (req, res) => { /* ... copy from index.js ... */ });

// Campaign routes
router.get('/campaigns', auth, async (req, res) => { /* ... copy from index.js ... */ });
router.post('/campaigns', [auth, adminAuth], async (req, res) => { /* ... copy from index.js ... */ });


// --- START SERVER ---
app.use('/api', router);
app.listen(PORT, () => console.log(`Local backend server running on port ${PORT}`));

// =========================================================================================
// Below are the full controller functions, copied for convenience
// =========================================================================================

async function connectDB_full() {
  try {
    if (mongoose.connections[0].readyState) return;
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected for local development.');
  } catch (err) {
    console.error('Local MongoDB Connection Failed:', err.message);
    process.exit(1);
  }
};
connectDB_full();

router.post('/users/signup', async (req, res) => {
    const { username, fullName, email, password, countryCode, phone } = req.body;
    try {
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: 'User with this email already exists.' });
        
        user = await User.findOne({ username });
        if (user) return res.status(400).json({ message: 'This username is already taken.' });

        user = new User({ username, fullName, email, password, countryCode, phone });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();

        const payload = { user: { id: user.id, role: user.role } };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' });
        
        res.status(201).json({ token });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

router.post('/users/signin', async (req, res) => {
    const { username, password } = req.body;
    try {
        let user = await User.findOne({ username });
        if (!user) return res.status(400).json({ message: 'Invalid credentials.' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials.' });

        const payload = { user: { id: user.id, role: user.role } };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' });

        res.json({ token });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

router.get('/campaigns', auth, async (req, res) => {
    try {
        const campaigns = await Campaign.find().sort({ status: 1, createdAt: -1 });
        res.json(campaigns);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.post('/campaigns', [auth, adminAuth], async (req, res) => {
    const { name, photo, budget, rules, assets, platforms, rewardPer1kViews, maxPayout, minPayout, category, status } = req.body;
    try {
        const newCampaign = new Campaign({
            name, photo, budget, rules, assets, platforms, rewardPer1kViews, maxPayout, minPayout, category, status
        });
        const campaign = await newCampaign.save();
        res.status(201).json(campaign);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});