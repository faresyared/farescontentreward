// api/getCampaignDetail.js
const { MongoClient, ObjectId } = require('mongodb');

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

    const campaignId = req.query.id;

    if (!campaignId) {
        return res.status(400).json({ message: 'Campaign ID is required.' });
    }

    try {
        const db = await connectToDatabase();
        const campaignsCollection = db.collection('campaigns');

        // Find the campaign by its ObjectId
        const campaign = await campaignsCollection.findOne({ _id: new ObjectId(campaignId) });

        if (!campaign) {
            return res.status(404).json({ message: 'Campaign not found.' });
        }

        res.status(200).json({ message: 'Campaign details fetched successfully!', campaign: campaign });

    } catch (error) {
        console.error('Get Campaign Detail Error:', error);
        // Handle invalid ObjectId format
        if (error.name === 'BSONTypeError') {
            return res.status(400).json({ message: 'Invalid Campaign ID format.' });
        }
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};
