const mongoose = require('mongoose');

const CampaignUpdateSchema = new mongoose.Schema({
  // Link to the user who wrote the update (the admin)
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // Link to the campaign this update belongs to
  campaign: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign',
    required: true,
  },
  // The content of the update post
  content: {
    type: String,
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.models.CampaignUpdate || mongoose.model('CampaignUpdate', CampaignUpdateSchema);