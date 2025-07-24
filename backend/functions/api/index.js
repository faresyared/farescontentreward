const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const connectDB = require('./db');

// --- CHANGE 1: Import the rate-limit package ---
const rateLimit = require('express-rate-limit');

// --- EXPRESS APP SETUP ---
const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// --- CHANGE 2: Configure and apply the rate limiter ---
// This will apply to all requests that start with /api
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per 15 minutes
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: 'Too many requests from this IP, please try again after 15 minutes',
});

// Apply the rate limiting middleware to all API routes
app.use('/api', limiter);


// --- IMPORT & USE ROUTES ---
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const campaignRoutes = require('./routes/campaignRoutes');
const postRoutes = require('./routes/postRoutes');
const adminRoutes = require('./routes/adminRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/admin', adminRoutes);

// --- NETLIFY HANDLER ---
const handler = serverless(app);

module.exports.handler = async (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false;
    await connectDB();
    return await handler(event, context);
};