// api/uploadProfilePhoto.js
const { MongoClient } = require('mongodb');
const formidable = require('formidable');
const cloudinary = require('cloudinary').v2;

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

    const form = formidable.formidable({});

    form.parse(req, async (err, fields, files) => {
        if (err) {
            console.error('Error parsing form data:', err);
            return res.status(500).json({ message: 'Error processing form data.', error: err.message });
        }

        const email = Array.isArray(fields.email) ? fields.email[0] : fields.email;
        const profilePhoto = files.profilePhoto ? (Array.isArray(files.profilePhoto) ? files.profilePhoto[0] : files.profilePhoto) : null;

        if (!email) {
            return res.status(400).json({ message: 'User email is required.' });
        }

        if (!profilePhoto) {
            return res.status(400).json({ message: 'No profile photo file provided.' });
        }

        let profilePhotoUrl = null;
        try {
            // Upload image to Cloudinary
            const uploadResult = await cloudinary.uploader.upload(profilePhoto.filepath, {
                folder: `profile_photos/${email.split('@')[0]}`, // Organize by username for easier management
                resource_type: "image",
                transformation: [
                    { width: 300, height: 300, crop: "fill", gravity: "face" } // Crop to a square, focus on face
                ]
            });
            profilePhotoUrl = uploadResult.secure_url;
            console.log('Cloudinary profile photo upload successful:', profilePhotoUrl);
        } catch (cloudinaryError) {
            console.error('Cloudinary profile photo upload error:', cloudinaryError);
            return res.status(500).json({ message: 'Failed to upload profile photo.', error: cloudinaryError.message });
        }

        try {
            const db = await connectToDatabase();
            const usersCollection = db.collection('users'); // Assuming your users are in a 'users' collection

            const result = await usersCollection.updateOne(
                { email: email },
                { $set: { profilePhotoUrl: profilePhotoUrl } }
            );

            if (result.matchedCount === 0) {
                return res.status(404).json({ message: 'User not found.' });
            }

            res.status(200).json({
                message: 'Profile photo uploaded and updated successfully!',
                profilePhotoUrl: profilePhotoUrl
            });

        } catch (error) {
            console.error('Update Profile Photo Error:', error);
            res.status(500).json({ message: 'Internal Server Error', error: error.message });
        }
    });
};
