const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const connectDB = require('./db');

// --- EXPRESS APP SETUP ---
const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// --- IMPORT ALL ROUTE FILES ---
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const campaignRoutes = require('./routes/campaignRoutes');
const postRoutes = require('./routes/postRoutes');
const adminRoutes = require('./routes/adminRoutes');

// --- USE ROUTES WITH PREFIXES ---
// This tells Express how to direct incoming requests.
// e.g., a request to '/api/posts/...' will be handled by postRoutes.
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/admin', adminRoutes);

// --- NETLIFY HANDLER ---
const handler = serverless(app);

module.exports.handler = async (event, context) => {
    // This line allows waiting for connections to close before finishing.
    context.callbackWaitsForEmptyEventLoop = false;
    
    // Connect to the database before handling the request
    await connectDB();
    
    // Handle the request using our Express app
    return await handler(event, context);
};