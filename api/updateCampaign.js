// api/updateCampaign.js
const { MongoClient, ObjectId } = require('mongodb');
const formidable = require('formidable');
const cloudinary = require('cloudinary').v2;
const jwt = require('jsonwebtoken');

export const config = {
    api: {
        bodyParser: false, // Required for formidable
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
    cachedDb = cachedClient.db('sheinfw3');
    return cachedDb;
}

module.exports = async (req, res) => {
    if (req.method !== 'POST') { // Using POST for file upload, can be PUT without file
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    if (!uri || !JWT_SECRET || !process.env.CLOUDINARY_CLOUD_NAME) {
        console.error("ERROR: Missing environment variables.");
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
        if (!decoded.isAdmin) { // Only allow admins to update campaigns
            return res.status(403).json({ message: 'Access Denied: Only administrators can update campaigns.' });
        }
    } catch (error) {
        console.error('Token or Admin Check Error:', error);
        return res.status(403).json({ message: 'Invalid token or insufficient permissions. Access Denied.' });
    }
    // --- End Token Verification and Admin Check ---

    const form = formidable.formidable({});

    form.parse(req, async (err, fields, files) => {
        if (err) {
            console.error('Error parsing form data:', err);
            return res.status(500).json({ message: 'Error processing form data.', error: err.message });
        }

        const getFieldValue = (fieldName) => Array.isArray(fields[fieldName]) ? fields[fieldName][0] : fields[fieldName];

        const campaignId = getFieldValue('id');
        if (!campaignId) {
            return res.status(400).json({ message: 'Campaign ID is required for update.' });
        }

        let updateFields = {};

        // Process all fields, only add to updateFields if they exist in the form data
        if (getFieldValue('name') !== undefined) updateFields.name = getFieldValue('name');
        if (getFieldValue('description') !== undefined) updateFields.description = getFieldValue('description');
        if (getFieldValue('category') !== undefined) updateFields.category = getFieldValue('category');
        if (getFieldValue('status') !== undefined) updateFields.status = getFieldValue('status'); // New: Status update

        // Handle array fields from textarea
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

        // Handle numeric fields
        const remainingBudgetVal = parseFloat(getFieldValue('remainingBudget'));
        if (!isNaN(remainingBudgetVal)) updateFields.remainingBudget = remainingBudgetVal;
        const payPer1kViewsVal = parseFloat(getFieldValue('payPer1kViews'));
        if (!isNaN(payPer1kViewsVal)) updateFields.payPer1kViews = payPer1kViewsVal;

        // Handle date fields
        if (getFieldValue('startDate') !== undefined && getFieldValue('startDate') !== '') updateFields.startDate = new Date(getFieldValue('startDate'));
        if (getFieldValue('endDate') !== undefined && getFieldValue('endDate') !== '') updateFields.endDate = new Date(getFieldValue('endDate'));


        // Handle campaign photo upload
        const campaignPhoto = files.campaignPhoto ? (Array.isArray(files.campaignPhoto) ? files.campaignPhoto[0] : files.campaignPhoto) : null;
        if (campaignPhoto && campaignPhoto.size > 0) {
            try {
                const uploadResult = await cloudinary.uploader.upload(campaignPhoto.filepath, {
                    folder: "campaign_photos",
                    resource_type: "image",
                    transformation: [{ width: 800, height: 450, crop: "fill", gravity: "auto" }]
                });
                updateFields.campaignPhotoUrl = uploadResult.secure_url;
                console.log('Cloudinary photo updated successfully:', updateFields.campaignPhotoUrl);
            } catch (cloudinaryError) {
                console.error('Cloudinary upload error:', cloudinaryError);
                return res.status(500).json({ message: 'Failed to upload new campaign photo.', error: cloudinaryError.message });
            }
        }

        try {
            const db = await connectToDatabase();
            const campaignsCollection = db.collection('campaigns');

            const result = await campaignsCollection.updateOne(
                { _id: new ObjectId(campaignId) },
                { $set: updateFields }
            );

            if (result.matchedCount === 0) {
                return res.status(404).json({ message: 'Campaign not found or no changes were made.' });
            }

            res.status(200).json({ message: 'Campaign updated successfully!' });

        } catch (error) {
            console.error('Update Campaign Error:', error);
            res.status(500).json({ message: 'Internal Server Error', error: error.message });
        }
    });
};
