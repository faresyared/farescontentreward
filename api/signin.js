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
        await cachedClient.connect(); // This line can throw an error if connection fails
    }

    cachedDb = cachedClient.db('sheinfw3'); // Replace with your actual database name
    console.log("LOG 3: MongoDB connected or reused connection. Database selected.");
    return cachedDb;
}

const uri = process.env.MONGODB_URI;

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

    cachedDb = cachedClient.db('your_database_name'); // Replace with your actual database name
    console.log("LOG 3: MongoDB connected or reused connection. Database selected.");
    return cachedDb;
}


module.exports = async (req, res) => {
    console.log("LOG 4: Request received in module.exports.");
    console.log("LOG 4.1: Request method:", req.method);
    console.log("LOG 4.2: Request body:", req.body); // Check if body is received

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
        const usersCollection = db.collection('users'); // Replace 'users' if your collection name is different

        console.log("LOG 7: Looking for user with email:", email);
        const user = await usersCollection.findOne({ email: email });
        console.log("LOG 8: FindOne result:", user ? "User found" : "User not found");

        if (!user) {
            console.log("LOG 8.1: User not found, returning 401.");
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        // !!! SECURITY WARNING: This is INSECURE for real applications !!!
        if (password !== user.password) {
            console.log("LOG 8.2: Password mismatch, returning 401.");
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        console.log("LOG 9: Sign-in successful, returning 200.");
        res.status(200).json({ message: 'Sign in successful!', user: { email: user.email } });

    } catch (error) {
        // This catch block handles errors within the try block
        console.error('LOG ERROR: Full error details:', error); // Log the full error object
        console.error('LOG ERROR: Error message:', error.message);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};
