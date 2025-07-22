const User = require('../models/User');

const adminAuth = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ msg: 'User not found' });
        if (user.role !== 'admin') {
            return res.status(403).json({ msg: 'Admin resource. Access denied.' });
        }
        next();
    } catch (err) {
        console.error('Admin auth error:', err);
        res.status(500).send('Server Error');
    }
};

module.exports = adminAuth;
