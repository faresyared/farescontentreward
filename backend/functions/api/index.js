const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const connectDB = require('./db');
const rateLimit = require('express-rate-limit');

// --- EXPRESS APP SETUP ---
const app = express();

// --- THIS IS THE FIX ---
// This one line tells Express to trust the headers set by Netlify's proxy.
// It MUST be placed before the rate limiter and other middleware.
app.set('trust proxy', 1);

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// --- CONFIGURE AND APPLY THE RATE LIMITER ---
// Now that 'trust proxy' is set, the limiter will correctly find the user's real IP.
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again after 15 minutes',
});

app.use(limiter);

// --- IMPORT & USE ROUTES ---
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const campaignRoutes = require('./routes/campaignRoutes');
const postRoutes = require('./routes/postRoutes');
const adminRoutes = require('./routes/adminRoutes');

// The prefixes are correct without '/api'
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/campaigns', campaignRoutes);
app.use('/posts', postRoutes);
app.use('/admin', adminRoutes);

// --- NETLIFY HANDLER ---
const handler = serverless(app);

module.exports.handler = async (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false;
    await connectDB();
    return await handler(event, context);
};