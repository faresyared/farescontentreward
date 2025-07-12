const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');

// Initialize Express
const app = express();
const port = 3000;

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Middleware for parsing form data
app.use(bodyParser.urlencoded({ extended: true }));

// Setup session middleware
app.use(session({
  secret: 'your-secret-key', 
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

// MongoDB connection string (replace with your own string from Atlas)
const dbURI = "mongodb+srv://yourUsername:yourPassword@cluster0.ahfpxs9.mongodb.net/myDatabase?retryWrites=true&w=majority";

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

  const user = await User.findOne({ username });

  if (user && user.password === password) {
    req.session.user = user;
    res.send('Logged in successfully!');
  } else {
    res.status(401).send('Invalid username or password');
  }
});

// Sign-up route (POST method to handle user registration)
app.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;

  const existingUser = await User.findOne({ $or: [{ username }, { email }] });
  if (existingUser) {
    return res.status(400).send('Username or email already exists.');
  }

  const newUser = new User({ username, email, password });

  try {
    await newUser.save();
    res.redirect('/');
  } catch (err) {
    res.status(500).send('Error creating user.');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
