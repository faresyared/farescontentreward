const express = require('express');
console.log('campaignRoutes.js: File loaded');

const Campaign = require('../models/campaignModel');
const { auth, adminAuth } = require('../middleware/auth');
const router = express.Router();

// GET all campaigns (with filters)
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

// GET a single campaign by ID
router.get('/:id', auth, async (req, res) => {
    try {
        const campaign = await Campaign.findById(req.params.id);
        if (!campaign) return res.status(404).json({ msg: 'Campaign not found' });
        res.json(campaign);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// POST (create) a new campaign (Admin Only)
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

// PUT (update) a campaign (Admin Only)
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

// DELETE a campaign (Admin Only)
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

// POST to join a campaign or add to waitlist
router.post('/:id/join', auth, async (req, res) => {
    try {
        const campaign = await Campaign.findById(req.params.id);
        const userId = req.user.id;
        if (!campaign) return res.status(404).json({ msg: 'Campaign not found' });
        
        if (campaign.participants.includes(userId) || campaign.waitlist.includes(userId)) {
            return res.status(400).json({ msg: 'User already in campaign or on waitlist' });
        }
        
        if (campaign.isPrivate) {
            campaign.waitlist.push(userId);
        } else {
            campaign.participants.push(userId);
        }
        await campaign.save();
        res.json(campaign);
    } catch (err) { console.error(err); res.status(500).send('Server Error'); }
});

// POST to approve a user from waitlist (Admin Only)
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