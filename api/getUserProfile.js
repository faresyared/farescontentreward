// api/getUserProfile.js
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

    const userEmail = req.query.email;

    if (!userEmail) {
        return res.status(400).json({ message: 'User email is required.' });
    }

    try {
        const db = await connectToDatabase();
        const usersCollection = db.collection('users');

        // Find the user by email
        // Project only necessary fields (exclude password for security)
        const user = await usersCollection.findOne(
            { email: userEmail },
            { projection: { password: 0 } } // Exclude password from the result
        );

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        res.status(200).json({ message: 'User profile fetched successfully!', user: user });

    } catch (error) {
        console.error('Get User Profile Error:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};
