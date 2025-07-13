// api/getCampaignDetails.js
const { MongoClient, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');

const uri = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET;

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

    cachedDb = cachedClient.db('sheinfw3');
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

    // --- Token Verification ---
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No token provided. Access Denied.' });
    }
    const token = authHeader.split(' ')[1];

    try {
        jwt.verify(token, JWT_SECRET);
    } catch (error) {
        console.error('Token Verification Error:', error);
        return res.status(403).json({ message: 'Invalid token. Access Denied.' });
    }
    // --- End Token Verification ---

    const campaignId = req.query.id;

    if (!campaignId) {
        return res.status(400).json({ message: 'Campaign ID is required.' });
    }

    try {
        const db = await connectToDatabase();
        const campaignsCollection = db.collection('campaigns');

        const campaign = await campaignsCollection.findOne({ _id: new ObjectId(campaignId) });

        if (!campaign) {
            return res.status(404).json({ message: 'Campaign not found.' });
        }

        res.status(200).json({ message: 'Campaign fetched successfully!', campaign: campaign });

    } catch (error) {
        console.error('Get Campaign Details Error:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};
