const mongoose = require('mongoose');

const ChannelSchema = new mongoose.Schema({ name: { type: String, required: true }, type: { type: String, required: true } });

const CampaignSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    photo: { type: String, required: true },
    budget: { type: Number, required: true },
    platforms: [{ type: String, enum: ['YouTube', 'X', 'Instagram', 'TikTok'], required: true }],
    rewardPer1kViews: { type: Number },
    type: { type: String, enum: ['UGC', 'Clipping', 'Faceless UGC'], required: true },
    maxPayout: { type: Number },
    minPayout: { type: Number },
    category: { type: String, enum: ['Personal Brand', 'Entertainment', 'Music'], required: true },
    status: { type: String, enum: ['Active', 'Ended', 'Soon', 'Paused'], default: 'Soon', required: true },
    isPrivate: { type: Boolean, default: false },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    channels: [ChannelSchema]
}, { timestamps: true });

module.exports = mongoose.models.Campaign || mongoose.model('Campaign', CampaignSchema);
