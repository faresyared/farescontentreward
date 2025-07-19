// backend/controllers/userController.js

const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// --- Sign-Up Controller ---
exports.signUp = async (req, res) => {
  const { username, fullName, email, password, countryCode, phone } = req.body;

  try {
    // 1. Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User with this email already exists.' });
    }
    
    let usernameExists = await User.findOne({ username });
    if (usernameExists) {
      return res.status(400).json({ message: 'This username is already taken.' });
    }

    // 2. Create a new user instance
    user = new User({
      username,
      fullName,
      email,
      password, // Plain text password for now
      countryCode,
      phone,
    });

    // 3. Hash the password before saving
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // 4. Save the user to the database
    await user.save();

    // 5. Create and return a JSON Web Token (JWT)
    const payload = {
      user: {
        id: user.id,
        role: user.role, // Include role in the token
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '5h' }, // Token expires in 5 hours
      (err, token) => {
        if (err) throw err;
        res.status(201).json({ token }); // Return the token to the client
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};


// --- Sign-In Controller ---
exports.signIn = async (req, res) => {
  const { username, password } = req.body;

  try {
    // 1. Check if user exists
    let user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    // 2. Compare the provided password with the hashed password in the database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    // 3. If credentials are correct, create and return a JWT
    const payload = {
      user: {
        id: user.id,
        role: user.role,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '5h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};