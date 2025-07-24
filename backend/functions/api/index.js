const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const connectDB = require('./db');

// --- EXPRESS APP SETUP ---
const app = express();
app.set('trust proxy', 1);
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// --- THIS IS THE NEW DIAGNOSTIC LOGGER ---
// This special middleware will run for EVERY request that hits our function.
// It will run BEFORE any of our routers.
app.use((req, res, next) => {
  // We are logging the HTTP method (GET, POST, etc.) and the exact path
  // that the Express app sees. This will tell us if the path is correct.
  console.log(`INCOMING REQUEST: ${req.method} ${req.path}`);
  
  // next() tells Express to continue processing the request and try to match it to our routers.
  next();
});


// --- IMPORT & USE ROUTES ---
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const campaignRoutes = require('./routes/campaignRoutes');
const postRoutes = require('./routes/postRoutes');
const adminRoutes = require('./routes/adminRoutes');

// This is the simple, correct routing setup.
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/campaigns', campaignRoutes);
app.use('/posts', postRoutes);
app.use('/admin', adminRoutes);

// --- NETLIFY HANDLER ---
const handler = serverless(app);

module.exports.handler = async (event, context) => {
    // This will show us the raw path that Netlify sends to the function.
    console.log(`HANDLER INVOKED WITH PATH: ${event.path}`);
    context.callbackWaitsForEmptyEventLoop = false;
    await connectDB();
    return await handler(event, context);
};