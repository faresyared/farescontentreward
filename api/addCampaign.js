// api/addCampaign.js
const { MongoClient } = require('mongodb');
const formidable = require('formidable'); // Import the formidable module
const cloudinary = require('cloudinary').v2; // Cloudinary SDK

// Crucial for Vercel: Disable default body parsing so formidable can handle it
export const config = {
    api: {
        bodyParser: false,
    },
};

// Configure Cloudinary using environment variables
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true, // Use HTTPS
});

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

    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
        console.error("Cloudinary environment variables are not set.");
        return res.status(500).json({ message: "Server configuration error: Cloudinary credentials missing." });
    }

    const form = formidable.formidable({}); // Correct way to initialize for formidable v3

    form.parse(req, async (err, fields, files) => {
        if (err) {
            console.error('Error parsing form data:', err);
            return res.status(500).json({ message: 'Error processing form data.', error: err.message });
        }

        // Helper to safely get field value (handles array vs single value from formidable)
        const getFieldValue = (fieldName) => Array.isArray(fields[fieldName]) ? fields[fieldName][0] : fields[fieldName];

        const name = getFieldValue('name');
        const description = getFieldValue('description');
        const startDate = getFieldValue('startDate');
        const endDate = getFieldValue('endDate');
        const category = getFieldValue('category');
        const remainingBudget = parseFloat(getFieldValue('remainingBudget'));
        const payPer1kViews = parseFloat(getFieldValue('payPer1kViews'));

        // Process multiline text fields into arrays directly from `fields`
        const customerRules = getFieldValue('customerRules')
            ? getFieldValue('customerRules').split('\n').map(rule => rule.trim()).filter(rule => rule)
            : [];

        const associatedFiles = getFieldValue('associatedFiles')
            ? getFieldValue('associatedFiles').split('\n').map(file => {
                const trimmed = file.trim();
                if (trimmed.includes('youtube.com') || trimmed.includes('youtu.be')) return { type: 'youtube', url: trimmed };
                if (trimmed.includes('drive.google.com')) return { type: 'drive', url: trimmed };
                if (trimmed.includes('instagram.com')) return { type: 'instagram', url: trimmed };
                if (trimmed.includes('tiktok.com')) return { type: 'tiktok', url: trimmed };
                if (trimmed.includes('twitter.com') || trimmed.includes('x.com')) return { type: 'x', url: trimmed };
                return { type: 'other', url: trimmed };
            }).filter(file => file.url)
            : [];

        const clipperPlatforms = getFieldValue('clipperPlatforms')
            ? getFieldValue('clipperPlatforms').split(',').map(platform => platform.trim().toLowerCase()).filter(platform => platform)
            : [];

        const videoExamples = getFieldValue('videoExamples')
            ? getFieldValue('videoExamples').split('\n').map(url => {
                let processedUrl = url.trim();
                // Convert common YouTube share/watch URLs to embed URLs
                if (processedUrl.includes('youtube.com/watch?v=')) {
                    processedUrl = processedUrl.replace('watch?v=', 'embed/');
                } else if (processedUrl.includes('youtu.be/')) {
                    processedUrl = processedUrl.replace('youtu.be/', 'youtube.com/embed/');
                }
                // Add modestbranding and rel=0 for cleaner embeds
                if (processedUrl.includes('youtube.com/embed/') && !processedUrl.includes('?')) {
                    processedUrl += '?modestbranding=1&rel=0';
                } else if (processedUrl.includes('youtube.com/embed/') && processedUrl.includes('?')) {
                    processedUrl += '&modestbranding=1&rel=0';
                }
                return processedUrl;
            }).filter(url => url)
            : [];

        const campaignPhoto = files.campaignPhoto ? (Array.isArray(files.campaignPhoto) ? files.campaignPhoto[0] : files.campaignPhoto) : null;

        if (!name || !description || !startDate || !endDate || !campaignPhoto || !category || remainingBudget === undefined || payPer1kViews === undefined) {
            return res.status(400).json({ message: 'Missing required campaign fields (name, description, dates, photo, category, budget, pay per view).' });
        }
        if (isNaN(remainingBudget) || isNaN(payPer1kViews)) {
            return res.status(400).json({ message: 'Remaining Budget and Pay per 1K Views must be valid numbers.' });
        }


        let campaignPhotoUrl = null;
        try {
            // Upload image to Cloudinary
            const uploadResult = await cloudinary.uploader.upload(campaignPhoto.filepath, {
                folder: "campaign_photos", // Optional: organize uploads into a specific folder
                resource_type: "image",
                transformation: [
                    { width: 800, height: 450, crop: "fill", gravity: "auto" } // Optional: basic optimization
                ]
            });
            campaignPhotoUrl = uploadResult.secure_url;
            console.log('Cloudinary upload successful:', campaignPhotoUrl);
        } catch (cloudinaryError) {
            console.error('Cloudinary upload error:', cloudinaryError);
            return res.status(500).json({ message: 'Failed to upload campaign photo.', error: cloudinaryError.message });
        }

        try {
            const db = await connectToDatabase();
            const campaignsCollection = db.collection('campaigns');

            const newCampaign = {
                name,
                description,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                campaignPhotoUrl,
                category,
                customerRules,
                associatedFiles,
                clipperPlatforms,
                remainingBudget,
                payPer1kViews,
                videoExamples,
                createdAt: new Date()
            };

            const result = await campaignsCollection.insertOne(newCampaign);

            if (result.acknowledged) {
                res.status(201).json({ message: 'Campaign added successfully!', campaignId: result.insertedId });
            } else {
                res.status(500).json({ message: 'Failed to add campaign to database.' });
            }

        } catch (error) {
            console.error('Add Campaign Error:', error);
            res.status(500).json({ message: 'Internal Server Error', error: error.message });
        }
    });
};
