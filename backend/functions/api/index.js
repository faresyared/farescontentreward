const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const connectDB = require('./db');

// --- EXPRESS APP SETUP ---
const app = express();

// It is still good practice to keep this line for Netlify
app.set('trust proxy', 1);

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// --- IMPORT ALL ROUTE FILES ---
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const campaignRoutes = require('./routes/campaignRoutes');
const postRoutes = require('./routes/postRoutes');
const adminRoutes = require('./routes/adminRoutes');

// --- USE THE ROUTES WITHOUT THE '/api' PREFIX ---
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
