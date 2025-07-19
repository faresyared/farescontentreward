// backend/models/User.js

const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true, // Removes whitespace
  },
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  countryCode: {
    type: String,
  },
  phone: {
    type: String,
  },
  avatar: {
    type: String,
    default: 'https://i.pravatar.cc/150', // Default avatar image
  },
  role: {
    type: String,
    enum: ['user', 'admin'], // Role must be one of these values
    default: 'user',
  },
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt fields
});

module.exports = mongoose.model('User', UserSchema);