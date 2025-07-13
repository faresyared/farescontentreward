// api/utils/auth.js
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

async function verifyToken(req) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new Error('No token provided. Access Denied.');
    }
    const token = authHeader.split(' ')[1];

    if (!JWT_SECRET) {
        throw new Error('JWT_SECRET environment variable is not set. Cannot verify token.');
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return decoded;
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            throw new Error('Invalid token. Session Expired. Please log in again.');
        } else if (error.name === 'JsonWebTokenError') {
            throw new Error('Invalid token. Access Denied.');
        }
        throw error;
    }
}

module.exports = verifyToken;
