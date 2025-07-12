// api/searchUsers.js
const { MongoClient } = require('mongodb');

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

    cachedDb = cachedClient.db('sheinfw3'); // IMPORTANT: Your database name
    return cachedDb;
}

module.exports = async (req, res) => {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    if (!uri) {
        console.error("ERROR: MONGODB_URI environment variable is NOT SET.");
        return res.status(500).json({ message: "Server configuration error: MONGODB_URI missing." });
    }

    const searchQuery = req.query.query;

    if (!searchQuery || searchQuery.trim().length < 1) {
        return res.status(400).json({ message: 'Search query is required.' });
    }

    try {
        const db = await connectToDatabase();
        const usersCollection = db.collection('users');

        // Build a robust search query using $or for multiple fields
        // Using regex for partial, case-insensitive matches
        const searchRegex = new RegExp(searchQuery, 'i'); // 'i' for case-insensitive

        const users = await usersCollection.find({
            $or: [
                { email: { $regex: searchRegex } },
                { phoneNumber: { $regex: searchRegex } }, // Assuming phoneNumber might be searchable
                { country: { $regex: searchRegex } }, // Assuming country might be searchable
                { role: { $regex: searchRegex } } // Search by role (e.g., 'clipper', 'admin')
                // You might also add fields like 'firstName', 'lastName' if your user schema has them
            ]
        })
        .project({ // Project only necessary fields to send to the client
            email: 1,
            role: 1,
            phoneNumber: 1,
            phoneCode: 1,
            country: 1,
            isAdmin: 1,
            profilePhotoUrl: 1
        })
        .limit(20) // Limit the number of results to prevent overwhelming the frontend
        .toArray();

        res.status(200).json({ message: 'Users fetched successfully!', users: users });

    } catch (error) {
        console.error('Search Users Error:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};
