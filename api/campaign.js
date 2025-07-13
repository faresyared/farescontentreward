// api/campaign.js
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

    const { subroute } = req.query; // e.g., /api/campaign?subroute=add

    try {
        const db = await connectToDatabase();
        const campaignsCollection = db.collection('campaigns');

        // All campaign actions require authentication
        const decodedToken = await verifyToken(req);
        const { isAdmin } = decodedToken;

        switch (subroute) {
            // --- ADD CAMPAIGN ---
            case 'add':
                if (req.method !== 'POST') {
                    return res.status(405).json({ message: 'Method Not Allowed' });
                }
                if (!isAdmin) {
                    return res.status(403).json({ message: 'Access Denied: Only administrators can add campaigns.' });
                }

                const formAdd = formidable.formidable({});
                formAdd.parse(req, async (err, fields, files) => {
                    if (err) {
                        console.error('Error parsing form data:', err);
                        return res.status(500).json({ message: 'Error processing form data.', error: err.message });
                    }

                    const getFieldValue = (fieldName) => Array.isArray(fields[fieldName]) ? fields[fieldName][0] : fields[fieldName];

                    const { name, description, category, remainingBudget, payPer1kViews, startDate, endDate } = fields;
                    const campaignPhoto = files.campaignPhoto ? (Array.isArray(files.campaignPhoto) ? files.campaignPhoto[0] : files.campaignPhoto) : null;

                    if (!name || !description || !category || !remainingBudget || !payPer1kViews || !startDate || !endDate || !campaignPhoto) {
                        return res.status(400).json({ message: 'All required fields are needed for campaign creation (name, description, category, budget, pay/1k views, start/end dates, and campaign photo).' });
                    }

                    let campaignPhotoUrl = '';
                    if (campaignPhoto && campaignPhoto.size > 0) {
                        try {
                            const uploadResult = await cloudinary.uploader.upload(campaignPhoto.filepath, {
                                folder: "campaign_photos",
                                resource_type: "image",
                                transformation: [{ width: 800, height: 450, crop: "fill", gravity: "auto" }]
                            });
                            campaignPhotoUrl = uploadResult.secure_url;
                        } catch (cloudinaryError) {
                            console.error('Cloudinary upload error:', cloudinaryError);
                            return res.status(500).json({ message: 'Failed to upload campaign photo.', error: cloudinaryError.message });
                        }
                    }

                    const customerRules = getFieldValue('customerRules')?.split('\n').map(rule => rule.trim()).filter(rule => rule) || [];
                    const associatedFiles = getFieldValue('associatedFiles')?.split('\n').map(file => {
                        const trimmed = file.trim();
                        if (trimmed.includes('youtube.com') || trimmed.includes('youtu.be')) return { type: 'youtube', url: trimmed };
                        if (trimmed.includes('drive.google.com')) return { type: 'drive', url: trimmed };
                        if (trimmed.includes('instagram.com')) return { type: 'instagram', url: trimmed };
                        if (trimmed.includes('tiktok.com')) return { type: 'tiktok', url: trimmed };
                        if (trimmed.includes('twitter.com') || trimmed.includes('x.com')) return { type: 'x', url: trimmed };
                        return { type: 'other', url: trimmed };
                    }).filter(file => file.url) || [];
                    const clipperPlatforms = getFieldValue('clipperPlatforms')?.split(',').map(platform => platform.trim().toLowerCase()).filter(platform => platform) || [];
                    const videoExamples = getFieldValue('videoExamples')?.split('\n').map(url => {
                        let processedUrl = url.trim();
                        if (processedUrl.includes('youtube.com/watch?v=')) {
                            processedUrl = processedUrl.replace('watch?v=', 'embed/');
                        } else if (processedUrl.includes('youtu.be/')) {
                            processedUrl = processedUrl.replace('youtu.be/', 'youtube.com/embed/');
                        }
                        if (processedUrl.includes('youtube.com/embed/') && !processedUrl.includes('?')) {
                            processedUrl += '?modestbranding=1&rel=0';
                        } else if (processedUrl.includes('youtube.com/embed/') && processedUrl.includes('?')) {
                            processedUrl += '&modestbranding=1&rel=0';
                        }
                        return processedUrl;
                    }).filter(url => url) || [];

                    const newCampaign = {
                        name: getFieldValue('name'),
                        description: getFieldValue('description'),
                        startDate: new Date(getFieldValue('startDate')),
                        endDate: new Date(getFieldValue('endDate')),
                        campaignPhotoUrl,
                        category: getFieldValue('category'),
                        customerRules,
                        associatedFiles,
                        clipperPlatforms,
                        remainingBudget: parseFloat(getFieldValue('remainingBudget')),
                        payPer1kViews: parseFloat(getFieldValue('payPer1kViews')),
                        videoExamples,
                        status: 'Active', // Default status
                        createdAt: new Date()
                    };

                    const result = await campaignsCollection.insertOne(newCampaign);
                    res.status(201).json({ message: 'Campaign added successfully!', campaignId: result.insertedId });
                });
                return; // Important: return here because formidable handles the response

            // --- GET ALL CAMPAIGNS ---
            case 'all':
                if (req.method !== 'GET') {
                    return res.status(405).json({ message: 'Method Not Allowed' });
                }
                const campaigns = await campaignsCollection.find({}).toArray();
                return res.status(200).json({ message: 'Campaigns fetched successfully!', campaigns: campaigns });

            // --- GET CAMPAIGN DETAILS ---
            case 'details':
                if (req.method !== 'GET') {
                    return res.status(405).json({ message: 'Method Not Allowed' });
                }
                const campaignId = req.query.id;
                if (!campaignId) {
                    return res.status(400).json({ message: 'Campaign ID is required.' });
                }
                const campaign = await campaignsCollection.findOne({ _id: new ObjectId(campaignId) });
                if (!campaign) {
                    return res.status(404).json({ message: 'Campaign not found.' });
                }
                return res.status(200).json({ message: 'Campaign fetched successfully!', campaign: campaign });

            // --- UPDATE CAMPAIGN ---
            case 'update':
                if (req.method !== 'POST') { // Using POST for file uploads
                    return res.status(405).json({ message: 'Method Not Allowed' });
                }
                if (!isAdmin) {
                    return res.status(403).json({ message: 'Access Denied: Only administrators can update campaigns.' });
                }

                const formUpdate = formidable.formidable({});
                formUpdate.parse(req, async (err, fields, files) => {
                    if (err) {
                        console.error('Error parsing form data:', err);
                        return res.status(500).json({ message: 'Error processing form data.', error: err.message });
                    }

                    const getFieldValue = (fieldName) => Array.isArray(fields[fieldName]) ? fields[fieldName][0] : fields[fieldName];

                    const campaignToUpdateId = getFieldValue('id');
                    if (!campaignToUpdateId) {
                        return res.status(400).json({ message: 'Campaign ID is required for update.' });
                    }

                    let updateFields = {};
                    if (getFieldValue('name') !== undefined) updateFields.name = getFieldValue('name');
                    if (getFieldValue('description') !== undefined) updateFields.description = getFieldValue('description');
                    if (getFieldValue('category') !== undefined) updateFields.category = getFieldValue('category');
                    if (getFieldValue('status') !== undefined) updateFields.status = getFieldValue('status');

                    const customerRulesRaw = getFieldValue('customerRules');
                    if (customerRulesRaw !== undefined) {
                        updateFields.customerRules = customerRulesRaw.split('\n').map(rule => rule.trim()).filter(rule => rule);
                    }
                    const associatedFilesRaw = getFieldValue('associatedFiles');
                    if (associatedFilesRaw !== undefined) {
                        updateFields.associatedFiles = associatedFilesRaw.split('\n').map(file => {
                            const trimmed = file.trim();
                            if (trimmed.includes('youtube.com') || trimmed.includes('youtu.be')) return { type: 'youtube', url: trimmed };
                            if (trimmed.includes('drive.google.com')) return { type: 'drive', url: trimmed };
                            if (trimmed.includes('instagram.com')) return { type: 'instagram', url: trimmed };
                            if (trimmed.includes('tiktok.com')) return { type: 'tiktok', url: trimmed };
                            if (trimmed.includes('twitter.com') || trimmed.includes('x.com')) return { type: 'x', url: trimmed };
                            return { type: 'other', url: trimmed };
                        }).filter(file => file.url);
                    }
                    const clipperPlatformsRaw = getFieldValue('clipperPlatforms');
                    if (clipperPlatformsRaw !== undefined) {
                        updateFields.clipperPlatforms = clipperPlatformsRaw.split(',').map(platform => platform.trim().toLowerCase()).filter(platform => platform);
                    }
                    const videoExamplesRaw = getFieldValue('videoExamples');
                    if (videoExamplesRaw !== undefined) {
                        updateFields.videoExamples = videoExamplesRaw.split('\n').map(url => {
                            let processedUrl = url.trim();
                            if (processedUrl.includes('youtube.com/watch?v=')) {
                                processedUrl = processedUrl.replace('watch?v=', 'embed/');
                            } else if (processedUrl.includes('youtu.be/')) {
                                processedUrl = processedUrl.replace('youtu.be/', 'youtube.com/embed/');
                            }
                            if (processedUrl.includes('youtube.com/embed/') && !processedUrl.includes('?')) {
                                processedUrl += '?modestbranding=1&rel=0';
                            } else if (processedUrl.includes('youtube.com/embed/') && processedUrl.includes('?')) {
                                processedUrl += '&modestbranding=1&rel=0';
                            }
                            return processedUrl;
                        }).filter(url => url);
                    }

                    const remainingBudgetVal = parseFloat(getFieldValue('remainingBudget'));
                    if (!isNaN(remainingBudgetVal)) updateFields.remainingBudget = remainingBudgetVal;
                    const payPer1kViewsVal = parseFloat(getFieldValue('payPer1kViews'));
                    if (!isNaN(payPer1kViewsVal)) updateFields.payPer1kViews = payPer1kViewsVal;
                    if (getFieldValue('startDate') !== undefined && getFieldValue('startDate') !== '') updateFields.startDate = new Date(getFieldValue('startDate'));
                    if (getFieldValue('endDate') !== undefined && getFieldValue('endDate') !== '') updateFields.endDate = new Date(getFieldValue('endDate'));

                    const campaignPhoto = files.campaignPhoto ? (Array.isArray(files.campaignPhoto) ? files.campaignPhoto[0] : files.campaignPhoto) : null;
                    if (campaignPhoto && campaignPhoto.size > 0) {
                        try {
                            const uploadResult = await cloudinary.uploader.upload(campaignPhoto.filepath, {
                                folder: "campaign_photos",
                                resource_type: "image",
                                transformation: [{ width: 800, height: 450, crop: "fill", gravity: "auto" }]
                            });
                            updateFields.campaignPhotoUrl = uploadResult.secure_url;
                        } catch (cloudinaryError) {
                            console.error('Cloudinary upload error:', cloudinaryError);
                            return res.status(500).json({ message: 'Failed to upload new campaign photo.', error: cloudinaryError.message });
                        }
                    }

                    if (Object.keys(updateFields).length === 0) {
                        return res.status(200).json({ message: 'No fields to update.' });
                    }

                    const result = await campaignsCollection.updateOne(
                        { _id: new ObjectId(campaignToUpdateId) },
                        { $set: updateFields }
                    );

                    if (result.matchedCount === 0) {
                        return res.status(404).json({ message: 'Campaign not found or no changes were made.' });
                    }
                    res.status(200).json({ message: 'Campaign updated successfully!' });
                });
                return; // Important: return here because formidable handles the response

            // --- DELETE CAMPAIGN ---
            case 'delete':
                if (req.method !== 'DELETE') {
                    return res.status(405).json({ message: 'Method Not Allowed' });
                }
                if (!isAdmin) {
                    return res.status(403).json({ message: 'Access Denied: Only administrators can delete campaigns.' });
                }
                const campaignToDeleteId = req.query.id;
                if (!campaignToDeleteId) {
                    return res.status(400).json({ message: 'Campaign ID is required for deletion.' });
                }

                const result = await campaignsCollection.deleteOne({ _id: new ObjectId(campaignToDeleteId) });
                if (result.deletedCount === 0) {
                    return res.status(404).json({ message: 'Campaign not found or already deleted.' });
                }
                return res.status(200).json({ message: 'Campaign deleted successfully!' });

            default:
                return res.status(404).json({ message: 'Campaign API subroute not found.' });
        }
    } catch (error) {
        console.error('Campaign API Error:', error);
        if (error.message.includes('token')) {
            return res.status(403).json({ message: error.message });
        }
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};
