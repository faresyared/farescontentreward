// api/signup.js
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

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

    // IMPORTANT: Your database name
    cachedDb = cachedClient.db('sheinfw3');
    return cachedDb;
}

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    if (!uri) {
        console.error("ERROR: MONGODB_URI environment variable is NOT SET.");
        return res.status(500).json({ message: "Server configuration error: MONGODB_URI missing. Please check Vercel environment variables." });
    }

    // Extract new fields from the request body
    const { email, password, phoneCode, phoneNumber, country, role } = req.body;

    // Enhanced validation for all new required fields
    if (!email || !password || !phoneCode || !phoneNumber || !country || !role) {
        return res.status(400).json({ message: 'All fields are required for signup.' });
    }

    // Basic validation for role
    if (!['clipper', 'content_creator'].includes(role)) {
        return res.status(400).json({ message: 'Invalid role selected.' });
    }

    try {
        const db = await connectToDatabase();
        const usersCollection = db.collection('users'); // Your users collection name

        // Check if user already exists
        const existingUser = await usersCollection.findOne({ email: email });
        if (existingUser) {
            return res.status(409).json({ message: 'User with this email already exists.' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds

        // Create new user document with all details
        const newUser = {
            email: email,
            password: hashedPassword,
            phoneCode: phoneCode,
            phoneNumber: phoneNumber,
            country: country,
            role: role, // Store the chosen role
            isAdmin: false, // Default to false for new sign-ups
            createdAt: new Date()
        };

        const result = await usersCollection.insertOne(newUser);

        res.status(201).json({
            message: 'User registered successfully!',
            userId: result.insertedId,
            user: {
                email: newUser.email,
                country: newUser.country,
                role: newUser.role
            }
        });

    } catch (error) {
        console.error('Sign Up Error:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};
