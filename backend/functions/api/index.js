const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const connectDB = require('./db');

// --- EXPRESS APP SETUP ---
const app = express();
app.set('trust proxy', 1); // Keep this for rate-limiting later
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// --- THIS IS THE FIX ---
// 1. Create a single, main router for our entire API.
const apiRouter = express.Router();

// 2. Import all of our specific route files.
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const campaignRoutes = require('./routes/campaignRoutes');
const postRoutes = require('./routes/postRoutes');
const adminRoutes = require('./routes/adminRoutes');

// 3. Tell our single main router how to use the specific routers.
//    e.g., any request to '/auth' will be handled by authRoutes.
apiRouter.use('/auth', authRoutes);
apiRouter.use('/users', userRoutes);
apiRouter.use('/campaigns', campaignRoutes);
apiRouter.use('/posts', postRoutes);
apiRouter.use('/admin', adminRoutes);

// 4. Tell the main Express app to use our single router for ANY request that comes in.
//    The path is just '/', because Netlify has already handled the /api part.
app.use('/', apiRouter);


// --- NETLIFY HANDLER ---
const handler = serverless(app);

module.exports.handler = async (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false;
    await connectDB();
    return await handler(event, context);
};