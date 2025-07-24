const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const connectDB = require('./db');

// --- EXPRESS APP SETUP ---
const app = express();
app.set('trust proxy', 1);
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// --- IMPORT ALL ROUTE FILES ---
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const campaignRoutes = require('./routes/campaignRoutes');
const postRoutes = require('./routes/postRoutes');
const adminRoutes = require('./routes/adminRoutes');

// --- THIS IS THE FIX ---
// The main router must listen for the "/api" prefix, because the logs prove
// that Netlify is sending the full path to the function.
const apiRouter = express.Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/users', userRoutes);
apiRouter.use('/campaigns', campaignRoutes);
apiRouter.use('/posts', postRoutes);
apiRouter.use('/admin', adminRoutes);

// Tell the main app to use our apiRouter for any requests that start with /api
app.use('/api', apiRouter);

// --- NETLIFY HANDLER ---
const handler = serverless(app);

module.exports.handler = async (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false;
    await connectDB();
    return await handler(event, context);
};