const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, trim: true, sparse: true },
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    avatar: { type: String, default: 'https://res.cloudinary.com/dqbgu5rwq/image/upload/v1753148273/avatar.png' },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    isActive: { type: Boolean, default: true },
    googleId: { type: String },
    passwordResetToken: { type: String },
    passwordResetExpires: { type: Date },
    
    // --- NEW FIELDS ---
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String },

}, { timestamps: true });

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);
