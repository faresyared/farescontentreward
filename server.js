const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');

// Initialize Express
const app = express();
const port = 3000;

// Middleware for parsing form data
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files like HTML, CSS, and JavaScript
app.use(express.static(path.join(__dirname, 'public')));

// Setup session middleware
app.use(session({
  secret: '0000', // Secret key for signing session IDs (can be anything)
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }  // set to true if you're using HTTPS (not needed for local dev)
}));

// MongoDB Atlas connection string (replace with your own string from Atlas)
const dbURI = "mongodb+srv://sheinfw3:DxRRMILrKKbnARzK@cluster0.ahfpxs9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";  // Replace with your URI

// Connect to MongoDB Atlas using Mongoose with increased timeouts
mongoose.connect(dbURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000, // Wait 30 seconds before timing out
  socketTimeoutMS: 45000  // Wait 45 seconds for operations to complete
})
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.log('MongoDB connection error:', err));

// Define a user schema using Mongoose
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

// Create a User model from the schema
const User = mongoose.model('User', userSchema);

// Serve the Sign In page when visiting the root URL (/)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));  // Send Sign In page
});

// Serve the Sign Up page when visiting the /signup URL
app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'signup.html'));  // Send Sign Up page
});

// Sign-in route (POST method to handle login)
app.post('/signin', async (req, res) => {
  const { username, password } = req.body;

  // Find user by username
  const user = await User.findOne({ username });

  // Check if the user exists and password matches
  if (user && user.password === password) {
    // Store user information in the session (this keeps the user "signed in")
    req.session.user = user;
    res.send('Logged in successfully!');
  } else {
    res.status(401).send('Invalid username or password');
  }
});

// Sign-up route (POST method to handle user registration)
app.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;

  // Check if the user already exists
  const existingUser = await User.findOne({ $or: [{ username }, { email }] });
  if (existingUser) {
    return res.status(400).send('Username or email already exists.');
  }

  // Create a new user and save to the database
  const newUser = new User({ username, email, password });

  try {
    await newUser.save();
    // After successful sign-up, redirect to the Sign In page
    res.redirect('/');
  } catch (err) {
    res.status(500).send('Error creating user.');
  }
});

// Dashboard route (only accessible if the user is signed in)
app.get('/dashboard', (req, res) => {
  if (req.session.user) {
    res.send(`Welcome back, ${req.session.user.username}!`);
  } else {
    res.status(401).send('You must be logged in to view this page.');
  }
});

// Sign out route (to log out the user)
app.post('/signout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send('Failed to log out');
    }
    res.send('Logged out successfully');
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
