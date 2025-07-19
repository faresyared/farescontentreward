// backend/functions/index.js

const express = require('express');
const mongoose = require('mongoose');
const serverless = require('serverless-http');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

// --- DATABASE CONNECTION ---
// We only want to connect once per instance
connectDB();

async function connectDB() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connection Successful.');
    } catch (err) {
        console.error('Initial MongoDB Connection Failed:', err);
    }
}

// --- MONGOOSE SCHEMAS (MODELS) ---
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
const User = mongoose.models.User || mongoose.model('User', UserSchema);

// --- EXPRESS APP & ROUTER ---
const app = express();
app.use(cors());
app.use(express.json());
const router = express.Router();

// --- API ROUTES WITH DETAILED LOGGING ---

// SignIn Route
router.post('/users/signin', async (req, res) => {
    console.log('--- SIGN-IN ROUTE HIT ---');
    const { username, password } = req.body;
    try {
        console.log(`Searching for user: ${username}`);
        const user = await User.findOne({ username });
        
        if (!user) {
            console.log('User not found.');
            return res.status(400).json({ message: 'Invalid credentials.' });
        }
        console.log(`User found: ${user.username}`);

        console.log('Comparing passwords...');
        const isMatch = await bcrypt.compare(password, user.password);
        
        if (!isMatch) {
            console.log('Password does not match.');
            return res.status(400).json({ message: 'Invalid credentials.' });
        }
        console.log('Password matches.');

        console.log('Creating JWT...');
        const payload = { user: { id: user.id, role: user.role } };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' });
        console.log('JWT created. Sending response.');
        
        return res.status(200).json({ token });

    } catch (err) {
        console.error('--- ERROR IN SIGN-IN ROUTE ---', err);
        return res.status(500).send('Server error');
    }
});

// SignUp Route (you can add similar logging here if needed)
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
    } catch (err) { res.status(500).send('Server error'); }
});


// --- FINAL SETUP ---
app.use('/api', router);
module.exports.handler = serverless(app);