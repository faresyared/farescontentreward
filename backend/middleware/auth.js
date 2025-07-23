const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const auth = (req, res, next) => {
    const token = req.header('x-auth-token');
    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user;
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};

const adminAuth = async (req, res, next) => {
    try {
        // The 'auth' middleware should run first to attach req.user
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        if (user.role !== 'admin') {
            return res.status(403).json({ msg: 'Admin resource. Access denied.' });
        }
        next();
    } catch (err) {
        console.error('Admin auth error:', err);
        res.status(500).send('Server Error');
    }
};

module.exports = { auth, adminAuth };