const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['Earning', 'Deposit'], required: true },
    amount: { type: Number, required: true },
    description: { type: String, required: true },
    campaign: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign' } // Optional link to a campaign
}, { timestamps: true });

module.exports = mongoose.models.Transaction || mongoose.model('Transaction', TransactionSchema);