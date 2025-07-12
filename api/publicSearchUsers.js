// api/publicSearchUsers.js
const { MongoClient, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');

const uri = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET; // Make sure this is set in Vercel

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

    cachedDb = cachedClient.db('sheinfw3'); // IMPORTANT: Your database name
    return cachedDb;
}

module.exports = async (req, res) => {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    if (!uri || !JWT_SECRET) {
        console.error("ERROR: MONGODB_URI or JWT_SECRET environment variables are NOT SET.");
        return res.status(500).json({ message: "Server configuration error: Missing environment variables." });
    }

    // --- Token Verification (Authentication) ---
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No token provided. Access Denied.' });
    }
    const token = authHeader.split(' ')[1];

    try {
        jwt.verify(token, JWT_SECRET); // Verify the token
    } catch (error) {
        console.error('Token Verification Error:', error);
        return res.status(403).json({ message: 'Invalid token. Access Denied.' });
    }
    // --- End Token Verification ---

    const searchQuery = req.query.query;

    if (!searchQuery || searchQuery.trim().length < 1) {
        return res.status(400).json({ message: 'Search query is required.' });
    }

    try {
        const db = await connectToDatabase();
        const usersCollection = db.collection('users');

        const searchRegex = new RegExp(searchQuery, 'i'); // 'i' for case-insensitive

        const users = await usersCollection.find({
            $or: [
                { username: { $regex: searchRegex } },
                { email: { $regex: searchRegex } } // You might want to allow email search for other users, or remove it.
                // Add 'name' here if you have a general 'name' field
            ]
        })
        .project({ // Only project non-sensitive fields for general users
            username: 1,
            email: 1, // Only if you want email visible to other users
            profilePhotoUrl: 1 // Allow displaying their profile photo
            // DO NOT project 'phoneNumber', 'role', 'isAdmin', 'country', etc.
        })
        .limit(10) // Limit results for general users, perhaps less than admin search
        .toArray();

        res.status(200).json({ message: 'Users fetched successfully!', users: users });

    } catch (error) {
        console.error('Public User Search Error:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};
