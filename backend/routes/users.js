// backend/routes/users.js

const express = require('express');
const router = express.Router();
const { signUp, signIn } = require('../controllers/userController');

// @route   POST api/users/signup
// @desc    Register a new user
// @access  Public
router.post('/signup', signUp);

// @route   POST api/users/signin
// @desc    Authenticate user & get token
// @access  Public
router.post('/signin', signIn);

module.exports = router;