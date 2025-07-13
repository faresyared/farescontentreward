// api/joinCampaign.js
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
    if (req.method !== 'POST') {
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

    const { campaignId, userEmail } = req.body;

    // Ensure the email from the token matches the one sent from the frontend
    if (decodedEmail !== userEmail) {
        return res.status(403).json({ message: 'Unauthorized: Token email does not match request email.' });
    }

    if (!campaignId || !userEmail) {
        return res.status(400).json({ message: 'Campaign ID and User Email are required.' });
    }

    try {
        const db = await connectToDatabase();
        const usersCollection = db.collection('users');
        const campaignsCollection = db.collection('campaigns'); // To verify campaign exists

        // First, verify the campaign exists
        const campaignExists = await campaignsCollection.findOne({ _id: new ObjectId(campaignId) }, { projection: { _id: 1 } });
        if (!campaignExists) {
            return res.status(404).json({ message: 'Campaign not found.' });
        }

        // Add campaignId to the user's myCampaigns array if not already present
        const result = await usersCollection.updateOne(
            { email: userEmail },
            { $addToSet: { myCampaigns: new ObjectId(campaignId) } } // $addToSet prevents duplicates
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }
        if (result.modifiedCount === 0) {
            return res.status(200).json({ message: 'Campaign already in your list!' });
        }

        res.status(200).json({ message: 'Campaign added to your list successfully!' });

    } catch (error) {
        console.error('Join Campaign Error:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};
