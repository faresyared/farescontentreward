// api/addCampaign.js
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
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    if (!uri) {
        console.error("ERROR: MONGODB_URI environment variable is NOT SET.");
        return res.status(500).json({ message: "Server configuration error: MONGODB_URI missing." });
    }

    // Basic "admin" check (client-side passed isAdmin flag).
    // In a real application, you would verify an authentication token
    // and check the user's role on the server-side, not rely on client-side state.
    // For this example, we'll assume the client-side isAdmin is sufficient for now.
    // You'd pass an auth token and verify it here.
    // const userIsAdmin = req.headers['x-is-admin'] === 'true'; // Example of checking a custom header
    // if (!userIsAdmin) {
    //     return res.status(403).json({ message: 'Forbidden: Admin access required.' });
    // }

    const { name, description, startDate, endDate } = req.body;

    if (!name || !description || !startDate || !endDate) {
        return res.status(400).json({ message: 'All campaign fields are required.' });
    }

    try {
        const db = await connectToDatabase();
        // Create a new collection for campaigns if it doesn't exist
        const campaignsCollection = db.collection('campaigns');

        const newCampaign = {
            name,
            description,
            startDate: new Date(startDate), // Store dates as Date objects
            endDate: new Date(endDate),
            createdAt: new Date(),
            // You might also add 'createdBy' user ID here from the token
        };

        const result = await campaignsCollection.insertOne(newCampaign);

        res.status(201).json({ message: 'Campaign added successfully!', campaignId: result.insertedId, campaign: newCampaign });

    } catch (error) {
        console.error('Add Campaign Error:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};
