// backend/models/Campaign.js

const mongoose = require('mongoose');

const CampaignSchema = new mongoose.Schema({
  name: { type: String, required: true },
  photo: { type: String, required: true },
  budget: { type: Number, required: true },
  rules: { type: String, required: true },
  assets: { type: String }, // Link to assets folder/file
  platforms: [{ type: String, enum: ['YouTube', 'X', 'Instagram', 'TikTok'] }],
  rewardPer1kViews: { type: Number },
  maxPayout: { type: Number },
  minPayout: { type: Number },
  category: { type: String, enum: ['Personal Brand', 'Entertainment', 'Music'] },
  status: {
    type: String,
    enum: ['Active', 'Ended', 'Soon', 'Paused'],
    default: 'Soon',
  },
  // We can add a field to track which users are participating
  // participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, {
  timestamps: true,
});

module.exports = mongoose.model('Campaign', CampaignSchema);