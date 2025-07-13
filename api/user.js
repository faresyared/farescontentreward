// api/user.js
const { MongoClient, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
const formidable = require('formidable');
const cloudinary = require('cloudinary').v2;

export const config = {
    api: {
        bodyParser: false, // Required for formidable for photo uploads
    },
};

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});

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
    cachedDb = cachedClient.db('sheinfw3'); // IMPORTANT: Your database name
    return cachedDb;
}

// Middleware to verify JWT token and extract user info
async function verifyToken(req) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new Error('No token provided. Access Denied.');
    }
    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return decoded; // Contains email, isAdmin, and userId
    } catch (error) {
        throw new Error('Invalid token. Access Denied.');
    }
}

module.exports = async (req, res) => {
    if (!uri || !JWT_SECRET || !process.env.CLOUDINARY_CLOUD_NAME) {
        console.error("ERROR: Missing environment variables.");
        return res.status(500).json({ message: "Server configuration error: Missing environment variables." });
    }

    const { subroute } = req.query; // e.g., /api/user?subroute=profile

    try {
        const db = await connectToDatabase();
        const usersCollection = db.collection('users');
        const campaignsCollection = db.collection('campaigns'); // Needed for myCampaigns and joinCampaign

        // Verify token for all subroutes
        const decodedToken = await verifyToken(req);
        const { email: userEmail, isAdmin, userId } = decodedToken;

        switch (subroute) {
            // --- PROFILE MANAGEMENT ---
            case 'profile':
                if (req.method === 'GET') {
                    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
                    if (!user) {
                        return res.status(404).json({ message: 'User not found.' });
                    }
                    // Omit sensitive fields like password
                    const { password, ...userProfile } = user;
                    return res.status(200).json({ message: 'User profile fetched successfully!', user: userProfile });
                } else if (req.method === 'POST') { // Assuming POST for profile update due to possible file upload
                    const form = formidable.formidable({});
                    form.parse(req, async (err, fields, files) => {
                        if (err) {
                            console.error('Error parsing form data:', err);
                            return res.status(500).json({ message: 'Error processing form data.', error: err.message });
                        }

                        const getFieldValue = (fieldName) => Array.isArray(fields[fieldName]) ? fields[fieldName][0] : fields[fieldName];

                        let updateFields = {};
                        if (getFieldValue('username') !== undefined) updateFields.username = getFieldValue('username');
                        if (getFieldValue('phoneNumber') !== undefined) updateFields.phoneNumber = getFieldValue('phoneNumber');
                        if (getFieldValue('phoneCode') !== undefined) updateFields.phoneCode = getFieldValue('phoneCode');
                        if (getFieldValue('country') !== undefined) updateFields.country = getFieldValue('country');
                        if (getFieldValue('role') !== undefined) updateFields.role = getFieldValue('role');
                        if (getFieldValue('oldPassword') !== undefined && getFieldValue('newPassword') !== undefined) {
                            // This would require bcrypt to check old password,
                            // For simplicity here, we're assuming frontend handles current password verification
                            // or it's just for setting a new password (less secure without old password check)
                            // For this combined function, let's keep it simple.
                            // In a real app, password change should be a dedicated, separate, more secure endpoint.
                            // For now, removing direct password update from here to simplify.
                            // If re-added, you MUST fetch user, compare old password with bcrypt.compare, then bcrypt.hash new one.
                        }

                        const profilePhoto = files.profilePhoto ? (Array.isArray(files.profilePhoto) ? files.profilePhoto[0] : files.profilePhoto) : null;
                        if (profilePhoto && profilePhoto.size > 0) {
                            try {
                                const uploadResult = await cloudinary.uploader.upload(profilePhoto.filepath, {
                                    folder: "profile_photos",
                                    resource_type: "image",
                                    transformation: [{ width: 400, height: 400, crop: "fill", gravity: "face" }]
                                });
                                updateFields.profilePhotoUrl = uploadResult.secure_url;
                            } catch (cloudinaryError) {
                                console.error('Cloudinary upload error:', cloudinaryError);
                                return res.status(500).json({ message: 'Failed to upload profile photo.', error: cloudinaryError.message });
                            }
                        }

                        if (Object.keys(updateFields).length === 0) {
                            return res.status(200).json({ message: 'No fields to update.' });
                        }

                        const result = await usersCollection.updateOne(
                            { _id: new ObjectId(userId) },
                            { $set: updateFields }
                        );

                        if (result.matchedCount === 0) {
                            return res.status(404).json({ message: 'User not found.' });
                        }
                        res.status(200).json({ message: 'Profile updated successfully!' });
                    });
                    return; // Important: return here because formidable handles the response
                } else {
                    return res.status(405).json({ message: 'Method Not Allowed' });
                }

            // --- ADMIN USER SEARCH ---
            case 'adminSearch':
                if (req.method === 'GET') {
                    if (!isAdmin) {
                        return res.status(403).json({ message: 'Access Denied: Only administrators can use this search.' });
                    }
                    const searchQuery = req.query.query;
                    if (!searchQuery || searchQuery.trim().length < 1) {
                        return res.status(400).json({ message: 'Search query is required.' });
                    }

                    const searchRegex = new RegExp(searchQuery, 'i');
                    const users = await usersCollection.find({
                        $or: [
                            { email: { $regex: searchRegex } },
                            { phoneNumber: { $regex: searchRegex } },
                            { country: { $regex: searchRegex } },
                            { role: { $regex: searchRegex } },
                            { username: { $regex: searchRegex } }
                        ]
                    })
                    .project({
                        email: 1, username: 1, role: 1, phoneNumber: 1, phoneCode: 1, country: 1, isAdmin: 1, profilePhotoUrl: 1
                    })
                    .limit(20)
                    .toArray();
                    return res.status(200).json({ message: 'Users fetched successfully!', users: users });
                } else {
                    return res.status(405).json({ message: 'Method Not Allowed' });
                }

            // --- PUBLIC USER SEARCH ---
            case 'publicSearch':
                if (req.method === 'GET') {
                    const searchQuery = req.query.query;
                    if (!searchQuery || searchQuery.trim().length < 1) {
                        return res.status(400).json({ message: 'Search query is required.' });
                    }

                    const searchRegex = new RegExp(searchQuery, 'i');
                    const users = await usersCollection.find({
                        $or: [
                            { username: { $regex: searchRegex } },
                            { email: { $regex: searchRegex } },
                            { email: { $regex: new RegExp(`^${searchQuery.split('@')[0]}`, 'i') } }
                        ]
                    })
                    .project({ username: 1, email: 1, profilePhotoUrl: 1 })
                    .limit(10)
                    .toArray();
                    return res.status(200).json({ message: 'Users fetched successfully!', users: users });
                } else {
                    return res.status(405).json({ message: 'Method Not Allowed' });
                }

            // --- MY CAMPAIGNS ---
            case 'myCampaigns':
                if (req.method === 'GET') {
                    const user = await usersCollection.findOne(
                        { _id: new ObjectId(userId) },
                        { projection: { myCampaigns: 1 } }
                    );

                    if (!user || !user.myCampaigns || user.myCampaigns.length === 0) {
                        return res.status(200).json({ message: 'No campaigns in your list.', campaigns: [] });
                    }

                    const campaignIds = user.myCampaigns;
                    const campaigns = await campaignsCollection.find({
                        _id: { $in: campaignIds }
                    }).toArray();
                    return res.status(200).json({ message: 'User campaigns fetched successfully!', campaigns: campaigns });
                } else {
                    return res.status(405).json({ message: 'Method Not Allowed' });
                }

            // --- JOIN CAMPAIGN ---
            case 'joinCampaign':
                if (req.method === 'POST') {
                    const { campaignId } = req.body; // userEmail is implied from token

                    if (!campaignId) {
                        return res.status(400).json({ message: 'Campaign ID is required.' });
                    }

                    const campaignExists = await campaignsCollection.findOne({ _id: new ObjectId(campaignId) }, { projection: { _id: 1 } });
                    if (!campaignExists) {
                        return res.status(404).json({ message: 'Campaign not found.' });
                    }

                    const result = await usersCollection.updateOne(
                        { _id: new ObjectId(userId) }, // Use userId from token
                        { $addToSet: { myCampaigns: new ObjectId(campaignId) } }
                    );

                    if (result.matchedCount === 0) {
                        return res.status(404).json({ message: 'User not found.' });
                    }
                    if (result.modifiedCount === 0) {
                        return res.status(200).json({ message: 'Campaign already in your list!' });
                    }
                    return res.status(200).json({ message: 'Campaign added to your list successfully!' });
                } else {
                    return res.status(405).json({ message: 'Method Not Allowed' });
                }

            default:
                return res.status(404).json({ message: 'User API subroute not found.' });
        }
    } catch (error) {
        console.error('User API Error:', error);
        if (error.message.includes('token')) {
            return res.status(403).json({ message: error.message });
        }
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};
