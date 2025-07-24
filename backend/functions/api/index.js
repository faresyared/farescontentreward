const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const connectDB = require('./db');

// --- EXPRESS APP SETUP ---
const app = express();
app.set('trust proxy', 1);
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// --- IMPORT & USE ROUTES ---
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const campaignRoutes = require('./routes/campaignRoutes');
const postRoutes = require('./routes/postRoutes');
const adminRoutes = require('./routes/adminRoutes');

const apiRouter = express.Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/users', userRoutes);
apiRouter.use('/campaigns', campaignRoutes);
apiRouter.use('/posts', postRoutes);
apiRouter.use('/admin', adminRoutes);

app.use('/api', apiRouter);

// --- NETLIFY HANDLER ---
const handler = serverless(app);

module.exports.handler = async (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false;
    await connectDB();
    return await handler(event, context);
};