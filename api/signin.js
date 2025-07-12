// api/signin.js
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;

// Log 1: Function started
console.log("LOG 1: signin.js function started.");

let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
    console.log("LOG 2: Attempting to connect to database.");
    if (cachedDb) {
        console.log("LOG 2.1: Reusing cached database connection.");
        return cachedDb;
    }

    if (!cachedClient) {
        console.log("LOG 2.2: Creating new MongoClient and connecting.");
        cachedClient = new MongoClient(uri);
        // The .connect() method can throw an error if the URI is bad or network issues
        await cachedClient.connect();
    }

    // IMPORTANT: Make sure 'sheinfw3' is your actual database name in MongoDB Atlas
    cachedDb = cachedClient.db('sheinfw3');
    console.log("LOG 3: MongoDB connected or reused connection. Database selected.");
    return cachedDb;
}


// The entire duplicated section below this line was removed.
// The `module.exports` section should be the next part of the file.


module.exports = async (req, res) => {
    console.log("LOG 4: Request received in module.exports.");
    console.log("LOG 4.1: Request method:", req.method);
    console.log("LOG 4.2: Request body:", req.body); // Check if body is received

    // Check if MONGODB_URI is set. This was correctly moved inside module.exports earlier.
    if (!uri) {
        console.error("LOG ERROR: MONGODB_URI environment variable is NOT SET. This request cannot proceed.");
        return res.status(500).json({ message: "Server configuration error: MONGODB_URI missing. Please check Vercel environment variables." });
    }

    if (req.method !== 'POST') {
        console.log("LOG 4.3: Method not POST, returning 405.");
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { email, password } = req.body;

    if (!email || !password) {
        console.log("LOG 4.4: Missing email or password, returning 400.");
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    try {
        console.log("LOG 5: Attempting to get database connection.");
        const db = await connectToDatabase();
        console.log("LOG 6: Database connection obtained. Attempting to get collection 'users'.");
        // IMPORTANT: Make sure 'users' is the actual name of your collection
        const usersCollection = db.collection('users');

        console.log("LOG 7: Looking for user with email:", email);
        const user = await usersCollection.findOne({ email: email });
        console.log("LOG 8: FindOne result:", user ? "User found" : "User not found");

        if (!user) {
            console.log("LOG 8.1: User not found, returning 401.");
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        // !!! SECURITY WARNING: This is INSECURE for real applications !!!
        // You MUST use password hashing (e.g., bcryptjs) in production.
        if (password !== user.password) {
            console.log("LOG 8.2: Password mismatch, returning 401.");
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        console.log("LOG 9: Sign-in successful, returning 200.");
        res.status(200).json({ message: 'Sign in successful!', user: { email: user.email } });

    } catch (error) {
        console.error('LOG ERROR: Full error details:', error);
        console.error('LOG ERROR: Error message:', error.message);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};
