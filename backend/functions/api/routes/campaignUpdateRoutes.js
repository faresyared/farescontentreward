const express = require('express');
const router = express.Router({ mergeParams: true }); // Important: mergeParams allows us to get the :campaignId from the parent router
const { auth, adminAuth } = require('../middleware/auth');
const CampaignUpdate = require('../models/campaignUpdateModel');
const Campaign = require('../models/campaignModel');
const User = require('../models/userModel');

// GET all updates for a specific campaign
// Users must be a participant or an admin to view
router.get('/', auth, async (req, res) => {
  try {
    const { campaignId } = req.params;
    const userId = req.user.id;

    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found.' });
    }

    const userIsParticipant = campaign.participants.includes(userId);
    const userIsAdmin = req.user.role === 'admin';

    if (!userIsParticipant && !userIsAdmin) {
      return res.status(403).json({ message: 'You do not have access to this campaign.' });
    }

    const updates = await CampaignUpdate.find({ campaign: campaignId })
      .sort({ createdAt: -1 })
      .populate('author', 'username avatar'); // Get author info

    res.json(updates);
  } catch (err) {
    console.error('Error fetching campaign updates:', err);
    res.status(500).send('Server Error');
  }
});

// POST a new update to a campaign (Admin Only)
router.post('/', [auth, adminAuth], async (req, res) => {
  try {
    const { campaignId } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ message: 'Content is required.' });
    }

    const newUpdate = new CampaignUpdate({
      content,
      author: req.user.id,
      campaign: campaignId,
    });

    await newUpdate.save();
    const populatedUpdate = await CampaignUpdate.findById(newUpdate._id)
        .populate('author', 'username avatar');

    res.status(201).json(populatedUpdate);
  } catch (err) {
    console.error('Error creating campaign update:', err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;