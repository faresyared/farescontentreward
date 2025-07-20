// backend/functions/index.js

const express = require('express');
const mongoose = require('mongoose');
const serverless = require('serverless-http');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

// --- DATABASE CONNECTION ---
connectDB();
async function connectDB() {
    try {
        if (mongoose.connections[0].readyState) return;
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connection Successful.');
    } catch (err) {
        console.error('MongoDB Connection Failed:', err);
    }
}

// --- MONGOOSE SCHEMAS (MODELS) ---
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, trim: true },
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
}, { timestamps: true });

const CampaignSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    photo: { type: String, required: true },
    budget: { type: Number, required: true },
    rules: { type: String, required: true },
    assets: { type: String },
    platforms: [{ type: String, enum: ['YouTube', 'X', 'Instagram', 'TikTok'], required: true }],
    rewardPer1kViews: { type: Number },
    type: { type: String, enum: ['UGC', 'Clipping', 'Faceless UGC'], required: true },
    maxPayout: { type: Number },
    minPayout: { type: Number },
    category: { type: String, enum: ['Personal Brand', 'Entertainment', 'Music'], required: true },
    status: { type: String, enum: ['Active', 'Ended', 'Soon', 'Paused'], default: 'Soon', required: true },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Campaign = mongoose.models.Campaign || mongoose.model('Campaign', CampaignSchema);

// --- MIDDLEWARE ---
const auth = (req, res, next) => {
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user;
        next();
    } catch (err) { res.status(401).json({ msg: 'Token is not valid' }); }
};

const adminAuth = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ msg: 'User not found' });
        if (user.role !== 'admin') {
            return res.status(403).json({ msg: 'Admin resource. Access denied.' });
        }
        next();
    } catch (err) { 
        console.error('Admin auth error:', err);
        res.status(500).send('Server Error');
    }
};

// --- EXPRESS APP & ROUTER ---
const app = express();
app.use(cors());
app.use(express.json());
const router = express.Router();

// --- API ROUTES ---

// AUTH ROUTES
router.post('/users/signup', async (req, res) => {
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
        const payload = { user: { id: user.id, role: user.role } };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' });
        res.status(201).json({ token });
    } catch (err) { 
        console.error(err);
        res.status(500).send('Server error'); 
    }
});
router.post('/users/signin', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user) return res.status(400).json({ message: 'Invalid credentials.' });
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials.' });
        const payload = { user: { id: user.id, role: user.role } };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' });
        res.json({ token });
    } catch (err) { 
        console.error(err);
        res.status(500).send('Server error'); 
    }
});

// CAMPAIGN ROUTES
router.get('/campaigns', auth, async (req, res) => {
    try {
        const campaigns = await Campaign.find().sort({ status: 1, createdAt: -1 });
        res.json(campaigns);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

router.post('/campaigns', [auth, adminAuth], async (req, res) => {
    console.log("--- BACKEND: CREATE CAMPAIGN ROUTE HIT ---");
    console.log("--- BACKEND: RECEIVED DATA ---", req.body);
    try {
        const newCampaign = new Campaign(req.body);
        const campaign = await newCampaign.save();
        console.log("--- BACKEND: CAMPAIGN SAVED SUCCESSFULLY ---", campaign.name);
        res.status(201).json(campaign);
    } catch (err) {
        if (err.code === 11000) {
            console.error("--- BACKEND: DUPLICATE NAME ERROR ---", req.body.name);
            return res.status(400).json({ message: 'A campaign with this name already exists.' });
        }
        console.error("--- BACKEND: GENERIC ERROR ---", err);
        res.status(500).send('Server Error');
    }
});

router.get('/campaigns/:id', auth, async (req, res) => {
    try {
        const campaign = await Campaign.findById(req.params.id);
        if (!campaign) return res.status(404).json({ msg: 'Campaign not found' });
        res.json(campaign);
    } catch (err) { res.status(500).send('Server Error'); }
});

router.put('/campaigns/:id', [auth, adminAuth], async (req, res) => {
    try {
        let campaign = await Campaign.findById(req.params.id);
        if (!campaign) return res.status(404).json({ msg: 'Campaign not found' });
        campaign = await Campaign.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
        res.json(campaign);
    } catch (err) { res.status(500).send('Server Error'); }
});

// --- FINAL SETUP ---
app.use('/api', router);
const handler = serverless(app);

module.exports.handler = async (event, context) => {
    await connectDB();
    return await handler(event, context);
};