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
        // process.env keys are provided by Netlify build settings
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected via serverless function.');
    } catch (err) {
        console.error('MongoDB Connection Failed:', err.message);
    }
};
connectDB(); // Initialize connection

// --- MONGOOSE SCHEMA (MODELS) ---
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

const User = mongoose.model('User', UserSchema);

// --- EXPRESS APP SETUP ---
const app = express();
app.use(cors());
app.use(express.json());

const router = express.Router();

// --- API ROUTES AND CONTROLLERS ---

// Base API route
router.get('/', (req, res) => res.json({ message: 'Welcome to the Reelify API' }));

// SignUp Route
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

// SignIn Route
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

// --- ROUTER & EXPORT ---
app.use('/api', router);
module.exports.handler = serverless(app);