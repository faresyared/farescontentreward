// backend/localServer.js

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Connect to Database
connectDB();

const app = express();
const PORT = process.env.PORT || 3001; // We'll run our backend on port 3001

app.use(cors());
app.use(express.json());

// --- Define Routes ---
app.use('/api/users', require('./routes/users'));

// We don't need the serverless router wrapper here
app.get('/api', (req, res) => {
    res.json({ message: 'Welcome to the Reelify API (Local)' });
});


app.listen(PORT, () => console.log(`Backend server running locally on port ${PORT}`));