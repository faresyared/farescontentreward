// api/signin.js
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs'); // Import bcryptjs for password comparison

const uri = process.env.MONGODB_URI;

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

    // IMPORTANT: Use the same database name as in your signup.js and Atlas
    // Make sure 'sheinfw3' is your actual database name
    cachedDb = cachedClient.db('sheinfw3');
    return cachedDb;
}

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    // Ensure MONGODB_URI is set
    if (!uri) {
        console.error("ERROR: MONGODB_URI environment variable is NOT SET.");
        return res.status(500).json({ message: "Server configuration error: MONGODB_URI missing. Please check Vercel environment variables." });
    }

    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    try {
        const db = await connectToDatabase();
        const usersCollection = db.collection('users'); // Your users collection name

        const user = await usersCollection.findOne({ email: email });

        if (!user) {
            // Return generic message for security (don't tell attacker if email exists)
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        // Compare the provided password with the HASHED password stored in the database
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            // Return generic message for security
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        res.status(200).json({ message: 'Sign in successful!', user: { email: user.email } });

    } catch (error) {
        console.error('Sign In Error:', error); // Log the full error for debugging in Vercel logs
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};
