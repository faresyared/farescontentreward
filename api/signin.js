// api/signin.js
const { MongoClient } = require('mongodb');

// IMPORTANT: This URI will be pulled from Vercel's environment variables
const uri = process.env.MONGODB_URI;

if (!uri) {
    // This log will appear in Vercel's deployment logs if the variable is missing
    console.error("MONGODB_URI environment variable is NOT SET. Your API will not work.");
    // In a real app, you might want to return an error immediately here.
}

// This client will be reused across serverless function invocations
let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
    if (cachedDb) {
        return cachedDb;
    }

    if (!cachedClient) {
        cachedClient = new MongoClient(uri);
        await cachedClient.connect();
    }

    // Replace 'your_database_name' with the actual name of your database in MongoDB Atlas
    cachedDb = cachedClient.db('sheinfw3');
    console.log("MongoDB connected or reused connection.");
    return cachedDb;
}

module.exports = async (req, res) => {
    // Vercel serverless functions come with built-in body parsing for JSON
    // and handle CORS for simple cases.

    if (req.method !== 'POST') {
        // Only allow POST requests for sign-in
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { email, password } = req.body; // Get email and password from the request

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    try {
        const db = await connectToDatabase();
        // Replace 'users' with the actual name of your collection where users are stored
        const usersCollection = db.collection('users');

        // Find a user by email
        const user = await usersCollection.findOne({ email: email });

        if (!user) {
            // If no user found with that email
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        // !!! SECURITY WARNING: This is INSECURE for real applications !!!
        // You MUST use password hashing (e.g., bcryptjs) in production.
        // For now, we're doing a direct string comparison for learning purposes.
        if (password !== user.password) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        // If email and password match (insecurely for now)
        res.status(200).json({ message: 'Sign in successful!', user: { email: user.email } });

    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};
