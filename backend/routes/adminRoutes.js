const express = require('express');
const User = require('../models/userModel');
const Campaign = require('../models/campaignModel');
const Transaction = require('../models/transactionModel');
const { auth, adminAuth } = require('../middleware/auth');
const router = express.Router();

// GET all users (Admin Only)
router.get('/users', [auth, adminAuth], async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        console.error("Error fetching all users:", err);
        res.status(500).send('Server Error');
    }
});

// UPDATE a specific user's status/role (Admin Only)
router.put('/users/:id', [auth, adminAuth], async (req, res) => {
    try {
        const { role, isActive } = req.body;
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        
        user.role = role !== undefined ? role : user.role;
        user.isActive = isActive !== undefined ? isActive : user.isActive;
        
        await user.save();
        res.json(user);
    } catch (err) {
        console.error("Error updating user:", err);
        res.status(500).send('Server Error');
    }
});

// POST (create) a new transaction for a user (Admin Only)
router.post('/transactions', [auth, adminAuth], async (req, res) => {
    try {
        const { userId, type, amount, description } = req.body;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const newTransaction = new Transaction({ user: userId, type, amount, description });
        await newTransaction.save();
        res.status(201).json(newTransaction);
    } catch (err) {
        console.error("Error creating transaction:", err);
        res.status(500).send('Server Error');
    }
});

// GET admin analytics dashboard data (Admin Only)
router.get('/analytics', [auth, adminAuth], async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalCampaigns = await Campaign.countDocuments();
        const activeCampaigns = await Campaign.countDocuments({ status: 'Active' });
        
        const revenueData = await Transaction.aggregate([
            { $match: { type: 'Earning' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const totalRevenue = revenueData[0]?.total || 0;

        res.json({
            totalUsers,
            totalCampaigns,
            activeCampaigns,
            totalRevenue
        });
    } catch (err) {
        console.error("Error fetching analytics:", err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;