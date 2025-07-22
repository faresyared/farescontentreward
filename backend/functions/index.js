const express = require('express');
const mongoose = require('mongoose');
const serverless = require('serverless-http');
const cors = require('cors');
const authRoutes = require('../routes/authRoutes');
const campaignRoutes = require('../routes/campaignRoutes');
const postRoutes = require('../routes/postRoutes');

// --- DATABASE CONNECTION ---
let isConnected;
async function connectDB() {
    if (isConnected) return;
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGODB_URI);
        isConnected = true;
        console.log("MongoDB Connected");
    } catch (err) {
        console.error('MongoDB Connection Failed:', err);
    }
}

// --- EXPRESS APP ---
const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/posts', postRoutes);

// Serverless handler
const handler = serverless(app);

module.exports.handler = async (event, context) => {
    console.log("Handler triggered");
    context.callbackWaitsForEmptyEventLoop = false;
    try {
        await connectDB();
        return await handler(event, context);
    } catch (err) {
        console.error("Error in function execution:", err);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal Server Error', error: err.message })
        };
    }
};
