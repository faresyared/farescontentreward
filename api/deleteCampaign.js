// api/deleteCampaign.js
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
    if (req.method !== 'DELETE') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    if (!uri || !JWT_SECRET) {
        console.error("ERROR: MONGODB_URI or JWT_SECRET environment variables are NOT SET.");
        return res.status(500).json({ message: "Server configuration error: Missing environment variables." });
    }

    // --- Token Verification and Admin Check ---
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No token provided. Access Denied.' });
    }
    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (!decoded.isAdmin) { // Only allow admins to delete campaigns
            return res.status(403).json({ message: 'Access Denied: Only administrators can delete campaigns.' });
        }
    } catch (error) {
        console.error('Token or Admin Check Error:', error);
        return res.status(403).json({ message: 'Invalid token or insufficient permissions. Access Denied.' });
    }
    // --- End Token Verification and Admin Check ---

    const campaignId = req.query.id;

    if (!campaignId) {
        return res.status(400).json({ message: 'Campaign ID is required for deletion.' });
    }

    try {
        const db = await connectToDatabase();
        const campaignsCollection = db.collection('campaigns');

        const result = await campaignsCollection.deleteOne({ _id: new ObjectId(campaignId) });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Campaign not found or already deleted.' });
        }

        res.status(200).json({ message: 'Campaign deleted successfully!' });

    } catch (error) {
        console.error('Delete Campaign Error:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};
