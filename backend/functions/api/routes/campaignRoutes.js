const express = require('express');
console.log('campaignRoutes.js: File loaded');

const Campaign = require('../models/campaignModel');
// --- CHANGE 1: Import the User model ---
const User = require('../models/userModel'); 
const { auth, adminAuth } = require('../middleware/auth');
const router = express.Router();

// ... (GET, POST, PUT, DELETE routes for campaigns are unchanged)
router.get('/', auth, async (req, res) => {
    try {
        const { search, platform, type } = req.query;
        const query = {};
        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }
        if (platform && platform !== 'All Platforms') {
            query.platforms = { $in: [platform] };
        }
        if (type && type !== 'All Types') {
            query.type = type;
        }
        const campaigns = await Campaign.find(query).sort({ status: 1, createdAt: -1 });
        res.json(campaigns);
    } catch (err) {
        console.error("Error fetching campaigns:", err);
        res.status(500).send('Server Error');
    }
});
router.get('/:id', auth, async (req, res) => {
    try {
        const campaign = await Campaign.findById(req.params.id);
        if (!campaign) return res.status(404).json({ msg: 'Campaign not found' });
        res.json(campaign);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});
router.post('/', [auth, adminAuth], async (req, res) => {
    try {
        const newCampaign = new Campaign(req.body);
        const campaign = await newCampaign.save();
        res.status(201).json(campaign);
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ message: 'A campaign with this name already exists.' });
        }
        console.error(err);
        res.status(500).send('Server Error');
    }
});
router.put('/:id', [auth, adminAuth], async (req, res) => {
    try {
        let campaign = await Campaign.findById(req.params.id);
        if (!campaign) return res.status(404).json({ msg: 'Campaign not found' });
        campaign = await Campaign.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
        res.json(campaign);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});
router.delete('/:id', [auth, adminAuth], async (req, res) => {
    try {
        const campaign = await Campaign.findById(req.params.id);
        if (!campaign) {
            return res.status(404).json({ msg: 'Campaign not found' });
        }
        await Campaign.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Campaign removed' });
    } catch (err) {
        console.error("Error deleting campaign:", err);
        res.status(500).send('Server Error');
    }
});

// --- UPDATED JOIN ROUTE ---
router.post('/:id/join', auth, async (req, res) => {
    try {
        // --- CHANGE 2: Find the user who is making the request ---
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // --- CHANGE 3: Add the verification check ---
        // If the user is not verified, block them from joining.
        if (!user.isVerified) {
            return res.status(403).json({ msg: 'You must verify your email before joining a campaign.' });
        }

        const campaign = await Campaign.findById(req.params.id);
        if (!campaign) return res.status(404).json({ msg: 'Campaign not found' });
        
        if (campaign.participants.includes(user.id) || campaign.waitlist.includes(user.id)) {
            return res.status(400).json({ msg: 'User already in campaign or on waitlist' });
        }
        
        if (campaign.isPrivate) {
            campaign.waitlist.push(user.id);
        } else {
            campaign.participants.push(user.id);
        }
        await campaign.save();
        res.json(campaign);
    } catch (err) { console.error(err); res.status(500).send('Server Error'); }
});

// ... (Approve route is unchanged)
router.post('/:id/approve/:userId', [auth, adminAuth], async (req, res) => {
    try {
        const campaign = await Campaign.findById(req.params.id);
        if (!campaign) return res.status(404).json({ msg: 'Campaign not found' });
        
        const userToApprove = req.params.userId;
        campaign.waitlist.pull(userToApprove);
        campaign.participants.push(userToApprove);
        await campaign.save();
        res.json(campaign);
    } catch (err) { console.error(err); res.status(500).send('Server Error'); }
});

module.exports = router;