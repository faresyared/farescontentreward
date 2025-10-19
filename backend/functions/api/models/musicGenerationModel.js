const mongoose = require('mongoose');

const MusicGenerationSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    campaign: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign' },
    prompt: { type: String, required: true },
    title: { type: String },
    style: { type: String, default: 'Brazilian Phonk' },
    tempo: { type: String },
    mood: { type: String },
    vocals: { type: String },
    durationSeconds: { type: Number, default: 60 },
    status: {
        type: String,
        enum: ['queued', 'processing', 'completed', 'failed'],
        default: 'queued'
    },
    progress: { type: Number, min: 0, max: 100, default: 0 },
    audioUrl: { type: String },
    previewUrl: { type: String },
    waveformUrl: { type: String },
    storageKey: { type: String },
    externalJobId: { type: String },
    error: { type: String },
    metadata: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true });

module.exports = mongoose.models.MusicGeneration || mongoose.model('MusicGeneration', MusicGenerationSchema);
