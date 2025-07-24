const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const connectDB = require('./db');
const rateLimit = require('express-rate-limit');

// --- EXPRESS APP SETUP ---
const app = express();

// It's still good practice to trust the proxy, as it can help other middleware.
app.set('trust proxy', 1);

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// --- THIS IS THE DEFINITIVE FIX ---
// We create a custom function to tell the rate limiter EXACTLY where to find the IP.
const keyGenerator = (req) => {
  // This is the specific header Netlify uses to provide the user's real IP address.
  // We prioritize it.
  const ip = req.headers['x-nf-client-connection-ip'];
  
  // If that header exists, we use it. Otherwise, we fall back to the standard
  // 'x-forwarded-for' header, and finally to the default req.ip.
  return ip || req.headers['x-forwarded-for'] || req.ip;
};

// Configure the rate limiter to use our custom key generator.
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again after 15 minutes',
  keyGenerator: keyGenerator, // Use our custom function
});

// Apply the rate limiting middleware to all requests.
app.use(limiter);

// --- IMPORT & USE ROUTES ---
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const campaignRoutes = require('./routes/campaignRoutes');
const postRoutes = require('./routes/postRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Prefixes are correct without '/api'
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