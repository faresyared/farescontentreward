// api/uploadProfilePhoto.js
const { MongoClient, ObjectId } = require('mongodb');
const formidable = require('formidable'); // Library to handle file uploads

// This is required for Vercel Serverless Functions to parse multipart/form-data
// It tells Vercel not to parse the body automatically, so formidable can do it.
export const config = {
  api: {
    bodyParser: false,
  },
};

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

    const form = formidable({});

    form.parse(req, async (err, fields, files) => {
        if (err) {
            console.error('Formidable parse error:', err);
            return res.status(500).json({ message: 'Error parsing form data.', error: err.message });
        }

        const userEmail = Array.isArray(fields.email) ? fields.email[0] : fields.email;
        const profilePhoto = files.profilePhoto ? (Array.isArray(files.profilePhoto) ? files.profilePhoto[0] : files.profilePhoto) : null;

        if (!userEmail) {
            return res.status(400).json({ message: 'User email is required for photo upload.' });
        }
        if (!profilePhoto) {
            return res.status(400).json({ message: 'No photo file provided.' });
        }

        // --- SIMULATED IMAGE STORAGE ---
        // In a real app, you'd upload `profilePhoto` (which has properties like `filepath`, `mimetype`, `size`)
        // to Cloudinary, S3, etc. and get a URL back.
        // For this example, we'll generate a placeholder URL.
        const simulatedPhotoUrl = `https://picsum.photos/seed/${userEmail.replace(/[^a-zA-Z0-9]/g, '')}/120/120?t=${Date.now()}`;
        // You can replace 'picsum.photos' with your actual CDN/storage URL later.
        // You might want to validate file type/size here before "uploading"

        try {
            const db = await connectToDatabase();
            const usersCollection = db.collection('users');

            const updateResult = await usersCollection.updateOne(
                { email: userEmail },
                { $set: { profilePhotoUrl: simulatedPhotoUrl } }
            );

            if (updateResult.matchedCount === 0) {
                return res.status(404).json({ message: 'User not found.' });
            }

            res.status(200).json({
                message: 'Profile photo uploaded and updated successfully!',
                profilePhotoUrl: simulatedPhotoUrl
            });

        } catch (error) {
            console.error('Upload Profile Photo Error:', error);
            res.status(500).json({ message: 'Internal Server Error', error: error.message });
        }
    });
};
