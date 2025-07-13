// api/getMyCampaigns.js
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
        console.error("ERROR: Missing environment variables.");
        return res.status(500).json({ message: "Server configuration error: Missing environment variables." });
    }

    // --- Token Verification ---
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No token provided. Access Denied.' });
    }
    const token = authHeader.split(' ')[1];

    let decodedEmail;
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        decodedEmail = decoded.email; // Get email from token
    } catch (error) {
        console.error('Token Verification Error:', error);
        return res.status(403).json({ message: 'Invalid token. Access Denied.' });
    }
    // --- End Token Verification ---

    const userEmail = req.query.email;

    // Ensure the email from the token matches the one from query
    if (decodedEmail !== userEmail) {
        return res.status(403).json({ message: 'Unauthorized: Token email does not match request email.' });
    }

    if (!userEmail) {
        return res.status(400).json({ message: 'User email is required.' });
    }

    try {
        const db = await connectToDatabase();
        const usersCollection = db.collection('users');
        const campaignsCollection = db.collection('campaigns');

        // Find the user to get their myCampaigns array
        const user = await usersCollection.findOne(
            { email: userEmail },
            { projection: { myCampaigns: 1 } }
        );

        if (!user || !user.myCampaigns || user.myCampaigns.length === 0) {
            return res.status(200).json({ message: 'No campaigns in your list.', campaigns: [] });
        }

        // Get the list of campaign ObjectIds
        const campaignIds = user.myCampaigns;

        // Fetch the details of these campaigns
        const campaigns = await campaignsCollection.find({
            _id: { $in: campaignIds }
        }).toArray();

        res.status(200).json({ message: 'User campaigns fetched successfully!', campaigns: campaigns });

    } catch (error) {
        console.error('Get My Campaigns Error:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};
