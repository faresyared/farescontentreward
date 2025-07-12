const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const bcrypt = require('bcryptjs'); // Import bcryptjs

const app = express();

// Middleware for parsing form data
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the 'public' directory
// Ensure your index.html and signup.html are inside a 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Setup session middleware
app.use(session({
    secret: process.env.SESSION_SECRET || 'super-secret-default-key-for-dev', // Use environment variable for secret
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === 'production' } // 'true' in production (HTTPS), 'false' in development (HTTP)
}));

// MongoDB connection string - Use environment variable
const dbURI = process.env.DB_URI;

// Check if DB_URI is set
if (!dbURI) {
    console.error('MongoDB URI (DB_URI) not set in environment variables.');
    process.exit(1); // Exit if critical config is missing
}

// Connect to MongoDB Atlas
mongoose.connect(dbURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000
})
.then(() => console.log('Connected to MongoDB Atlas'))
.catch(err => {
    console.error('MongoDB connection error:', err);
    // Potentially exit or handle gracefully if DB connection fails
});

// Define a user schema using Mongoose
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true } // This will store the HASHED password
});

const User = mongoose.model('User', userSchema);

// Sign-up route (POST method to handle user registration)
app.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Check if the user already exists
        const existingUser = await User.findOne({ $or: [{ username: username }, { email: email }] });
        if (existingUser) {
            // Redirect with an error specific to username or email existence
            const errorType = existingUser.username === username ? 'usernameexists' : 'emailexists';
            return res.redirect(`/signup?error=${errorType}`);
        }

        // Hash the password before saving
        const salt = await bcrypt.genSalt(10); // Generate a salt
        const hashedPassword = await bcrypt.hash(password, salt); // Hash the password

        // Create a new user with the hashed password
        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();

        // After successful sign-up, redirect to the Sign In page
        res.redirect('/?signupSuccess=true'); // Added a flag for potential future use or confirmation
    } catch (err) {
        console.error('Error during user signup:', err); // Log the detailed error
        res.redirect('/signup?error=servererror'); // Redirect with a generic server error
    }
});

// Sign-in route (POST method to handle user login)
app.post('/signin', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Check if the user exists
        const user = await User.findOne({ username });

        if (user) {
            // Compare the provided password with the stored hashed password
            const isMatch = await bcrypt.compare(password, user.password);

            if (isMatch) {
                // Store user session if credentials are correct
                req.session.user = { id: user._id, username: user.username }; // Store minimal user data in session
                return res.redirect('/dashboard'); // Redirect to dashboard after successful login
            }
        }
        // If user not found or password does not match
        res.redirect('/?error=true'); // Redirect back to sign-in page with error
    } catch (err) {
        console.error('Error during user signin:', err);
        res.redirect('/?error=servererror'); // Redirect with a generic server error
    }
});

// Serve the Sign In page when visiting the root URL (/)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve the Sign Up page when visiting the /signup URL
app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

// Dashboard route (only accessible if the user is signed in)
app.get('/dashboard', (req, res) => {
    if (req.session.user) {
        res.send(`Welcome to the Dashboard, ${req.session.user.username}! You are logged in.`);
    } else {
        res.status(401).send('You must be logged in to view this page. <a href="/">Go to Sign In</a>');
    }
});

// Start the server
const port = process.env.PORT || 3000; // Use environment variable for port or default to 3000
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
