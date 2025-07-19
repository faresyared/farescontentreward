// backend/localServer.js

// --- IMPORTS ---
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const dotenv = require('dotenv');

// --- CONFIGURATION ---
// Configure dotenv to find the .env file in this backend folder
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
app.use(cors());
app.use(express.json());

// --- DATABASE CONNECTION ---
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected for local development.');
  } catch (err) {
    console.error('Local MongoDB Connection Failed:', err.message);
    process.exit(1);
  }
};
connectDB();

// --- MONGOOSE SCHEMA (MODELS) ---
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, trim: true },
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique:true },
    password: { type: String, required: true },
    countryCode: { type: String },
    phone: { type: String },
    avatar: { type: String, default: 'https://i.pravatar.cc/150' },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);

// --- API ROUTES ---
const router = express.Router();

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


// --- ATTACH ROUTER AND START SERVER ---
app.use('/api', router);
app.listen(PORT, () => console.log(`Local backend server running on port ${PORT}`));