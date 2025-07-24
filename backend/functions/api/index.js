const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const connectDB = require('./db');
const rateLimit = require('express-rate-limit');

// --- EXPRESS APP SETUP ---
const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// --- CONFIGURE AND APPLY THE RATE LIMITER ---
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, 
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again after 15 minutes',
});

// --- THIS IS THE FIX ---
// Apply the limiter to the root of the function, not a sub-path.
app.use(limiter);

// --- IMPORT ROUTES ---
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const campaignRoutes = require('./routes/campaignRoutes');
const postRoutes = require('./routes/postRoutes');
const adminRoutes = require('./routes/adminRoutes');

// --- THIS IS THE FIX ---
// The "/api" prefix has been removed from all routes.
// Express will now listen for "/auth", "/users", etc.
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