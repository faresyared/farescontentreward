// api/signup.js
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs'); // Import bcryptjs for password hashing

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

    // IMPORTANT: Use the same database name as in your signin.js and Atlas
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

        // 1. Check if user already exists
        const existingUser = await usersCollection.findOne({ email: email });
        if (existingUser) {
            return res.status(409).json({ message: 'User with this email already exists.' });
        }

        // 2. Hash the password before storing it
        // bcrypt.hash(password, saltRounds) - 10 is a good default for salt rounds
        const hashedPassword = await bcrypt.hash(password, 10);

        // 3. Insert new user with the hashed password
        const result = await usersCollection.insertOne({
            email: email,
            password: hashedPassword // Store the HASHED password
        });

        res.status(201).json({ message: 'User registered successfully!', userId: result.insertedId });

    } catch (error) {
        console.error('Sign Up Error:', error); // Log the full error for debugging in Vercel logs
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};
