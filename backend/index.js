// backend/index.js

const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const connectDB = require('./config/db');

// Connect to Database
connectDB();

const app = express();
const router = express.Router();

app.use(cors());
app.use(express.json()); // This line is crucial for parsing JSON request bodies

// --- Define Routes ---
router.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the Reelify API'
  });
});

// v-- This is the new line --v
app.use('/api/users', require('./routes/users')); 

// Catch-all for API base URL
app.use('/api', router); 

module.exports.handler = serverless(app);