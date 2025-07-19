const express = require('express');
const mongoose = require('mongoose');
const serverless = require('serverless-http');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

// --- DATABASE CONNECTION ---
let isConnected;
const connectDB = async () => {
    if (isConnected) return;
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        isConnected = true;
        console.log('MongoDB Connected.');
    } catch (err) {
        console.error('MongoDB Connection Failed:', err.message);
    }
};

// --- MONGOOSE SCHEMAS ---
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, trim: true },
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    countryCode: { type: String },
    phone: { type: String },
    avatar: { type: String, default: 'https://i.pravatar.cc/150' },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
}, { timestamps: true });

const CampaignSchema = new mongoose.Schema({
    name: { type: String, required: true },
    photo: { type: String, required: true },
    budget: { type: Number, required: true },
    rules: { type: String, required: true },
    platforms: [{ type: String, enum: ['YouTube', 'X', 'Instagram', 'TikTok'] }],
    status: { type: String, enum: ['Active', 'Ended', 'Soon', 'Paused'], default: 'Soon' },
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
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};

const adminAuth = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (user.role !== 'admin') {
            return res.status(403).json({ msg: 'Admin resource. Access denied.' });
        }
        next();
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

// --- EXPRESS APP & ROUTES ---
const app = express();
app.use(cors());
app.use(express.json());
const router = express.Router();

// --- AUTH ROUTES ---
router.post('/users/signup', async (req, res) => {
    await connectDB();

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
    await connectDB();

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
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// --- CAMPAIGN ROUTES ---
router.get('/campaigns', auth, async (req, res) => {
    await connectDB();

    try {
        const campaigns = await Campaign.find().sort({ createdAt: -1 });
        res.json(campaigns);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.post('/campaigns', [auth, adminAuth], async (req, res) => {
    await connectDB();

    try {
        const newCampaign = new Campaign(req.body);
        const campaign = await newCampaign.save();
        res.status(201).json(campaign);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// --- FINAL SETUP ---
app.use('/api', router);

const handler = serverless(app);
module.exports = app;
module.exports.handler = handler;
