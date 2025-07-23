const express = require('express');
console.log('index.js: Top of file');

const serverless = require('serverless-http');
const cors = require('cors');
const connectDB = require('./db');

// --- EXPRESS APP SETUP ---
const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
console.log('index.js: Express app configured');

// --- IMPORT & USE ROUTES ---
console.log('index.js: Importing routes...');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const campaignRoutes = require('./routes/campaignRoutes');
const postRoutes = require('./routes/postRoutes');
const adminRoutes = require('./routes/adminRoutes');
console.log('index.js: Routes imported successfully');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/admin', adminRoutes);
console.log('index.js: Routes attached to app');

// --- NETLIFY HANDLER ---
const handler = serverless(app);

module.exports.handler = async (event, context) => {
    console.log('index.js: Handler invoked');
    context.callbackWaitsForEmptyEventLoop = false;
    
    await connectDB();
    console.log('index.js: Database connection complete');
    
    return await handler(event, context);
};