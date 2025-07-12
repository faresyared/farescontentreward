const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const port = 3000;

// Middleware for parsing form data
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files like HTML, CSS, and JavaScript
app.use(express.static(path.join(__dirname, 'public')));

// Setup session middleware
app.use(session({
  secret: 'your-secret-key', 
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }  
}));

// MongoDB connection string
const dbURI = "mongodb+srv://yourUsername:yourPassword@cluster0.mongodb.net/myDatabase?retryWrites=true&w=majority";

// Connect to MongoDB Atlas
mongoose.connect(dbURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000, 
  socketTimeoutMS: 45000
})
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.log('MongoDB connection error:', err));

// Define a user schema using Mongoose
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);

// Sign-in route (POST method to handle login)
app.post('/signin', async (req, res) => {
  const { username, password } = req.body;

  // Find user by username
  const user = await User.findOne({ username });

  if (user && user.password === password) {
    req.session.user = user;
    res.redirect('/dashboard'); // Redirect to main page (dashboard)
  } else {
    res.redirect('/signin?error=true'); // Redirect back to sign-in page with an error query param
  }
});

// Serve the Sign In page when visiting the root URL (/)
app.get('/signin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html')); // Send Sign In page
});

// Serve the Sign Up page when visiting the /signup URL
app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'signup.html')); // Send Sign Up page
});

// Dashboard route (only accessible if the user is signed in)
app.get('/dashboard', (req, res) => {
  if (req.session.user) {
    res.send(`Welcome to the Dashboard, ${req.session.user.username}!`);
  } else {
    res.status(401).send('You must be logged in to view this page.');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
