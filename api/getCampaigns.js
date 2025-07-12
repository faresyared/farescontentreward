// api/getCampaigns.js
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

    try {
        const db = await connectToDatabase();
        const campaignsCollection = db.collection('campaigns');

        // Fetch all campaigns, sort by creation date (newest first)
        // Project only necessary fields for the initial list view
        const campaigns = await campaignsCollection.find({})
            .project({
                name: 1,
                campaignPhotoUrl: 1,
                remainingBudget: 1,
                payPer1kViews: 1,
                category: 1,
                description: 1 // Include description for possible card hover or truncation
            })
            .sort({ createdAt: -1 })
            .toArray();

        res.status(200).json({ message: 'Campaigns fetched successfully!', campaigns: campaigns });

    } catch (error) {
        console.error('Get Campaigns Error:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};
