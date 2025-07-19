// backend/functions/index.js

// --- IMPORTS ---
const express = require('express');
const mongoose = require('mongoose');
const serverless = require('serverless-http');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

// --- DATABASE CONNECTION ---
const connectDB = async () => {
    try {
        if (mongoose.connections[0].readyState) return; // Use existing connection if available
        await mongoose.connect(process.env.MONGODB_URI);
    } catch (err) { console.error('MongoDB Connection Failed:', err.message); }
};
connectDB();

// --- MONGOOSE SCHEMAS (MODELS) ---
const UserSchema = new mongoose.Schema({ /* ... user schema fields ... */
    username: { type: String, required: true, unique: true, trim: true },
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    countryCode: { type: String },
    phone: { type: String },
    avatar: { type: String, default: 'https://i.pravatar.cc/150' },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
}, { timestamps: true });
const User = mongoose.models.User || mongoose.model('User', UserSchema);


const CampaignSchema = new mongoose.Schema({ /* ... campaign schema fields ... */
  name: { type: String, required: true },
  photo: { type: String, required: true },
  budget: { type: Number, required: true },
  rules: { type: String, required: true },
  assets: { type: String },
  platforms: [{ type: String, enum: ['YouTube', 'X', 'Instagram', 'TikTok'] }],
  rewardPer1kViews: { type: Number },
  maxPayout: { type: Number },
  minPayout: { type: Number },
  category: { type: String, enum: ['Personal Brand', 'Entertainment', 'Music'] },
  status: { type: String, enum: ['Active', 'Ended', 'Soon', 'Paused'], default: 'Soon' },
}, { timestamps: true });
const Campaign = mongoose.models.Campaign || mongoose.model('Campaign', CampaignSchema);


// --- AUTHENTICATION MIDDLEWARE ---
const auth = (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) { res.status(401).json({ msg: 'Token is not valid' });}
};

const adminAuth = async (req, res, next) => {
    const user = await User.findById(req.user.id);
    if (user.role !== 'admin') {
        return res.status(403).json({ msg: 'Admin resource. Access denied.' });
    }
    next();
};


// --- EXPRESS APP SETUP ---
const app = express();
app.use(cors());
app.use(express.json());
const router = express.Router();


// --- API ROUTES AND CONTROLLERS ---
router.get('/', (req, res) => res.json({ message: 'Welcome to the Reelify API' }));
// ... (existing signup and signin routes are the same)
router.post('/users/signup', async (req, res) => { /* ... existing code ... */ });
router.post('/users/signin', async (req, res) => { /* ... existing code ... */ });


// == NEW CAMPAIGN ROUTES ==

// @route   GET api/campaigns
// @desc    Get all campaigns
// @access  Private (requires user to be logged in)
router.get('/campaigns', auth, async (req, res) => {
    try {
        const campaigns = await Campaign.find().sort({ status: 1, createdAt: -1 }); // Sort to show active ones first
        res.json(campaigns);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/campaigns
// @desc    Create a new campaign
// @access  Private (Admins only)
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


// --- ROUTER & EXPORT ---
app.use('/api', router);
module.exports.handler = serverless(app);

// Helper to keep existing signup/signin code without re-pasting
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