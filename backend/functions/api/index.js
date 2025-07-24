const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const connectDB = require('./db');

// --- EXPRESS APP SETUP ---
const app = express();

// We keep 'trust proxy' as it's good practice for Netlify.
app.set('trust proxy', 1);

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// --- ALL RATE LIMITER CODE HAS BEEN REMOVED FOR THIS TEST ---


// --- IMPORT & USE ROUTES ---
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const campaignRoutes = require('./routes/campaignRoutes');
const postRoutes = require('./routes/postRoutes');
const adminRoutes = require('./routes/adminRoutes');

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