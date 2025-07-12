const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Setup session middleware
app.use(session({
  secret: 'your-secret-key', // Secret key for signing session IDs (can be anything)
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }  // set to true if you're using HTTPS (not needed for local dev)
}));

// Body parser to parse POST request data
app.use(bodyParser.urlencoded({ extended: true }));

// Hardcoded user (you can add more users later or use a database)
const users = [
  { username: 'admin', password: 'admin123' },
  { username: 'user1', password: 'password1' }
];

// Sign-in route (POST method to handle login)
app.post('/signin', (req, res) => {
  const { username, password } = req.body;

  // Check if the user exists and password matches
  const user = users.find(u => u.username === username && u.password === password);
  
  if (user) {
    // Store user information in the session (this keeps the user "signed in")
    req.session.user = user;
    res.send('Logged in successfully!');
  } else {
    res.status(401).send('Invalid username or password');
  }
});

// Dashboard route (only accessible if the user is signed in)
app.get('/dashboard', (req, res) => {
  // Check if the user is logged in (has a session)
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
