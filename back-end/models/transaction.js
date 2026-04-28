const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    amount: { type: Number, required: true },
    category: {
        type: String,
        required: true,
        enum: ['food', 'housing', 'health', 'entertainment'],
    },
    date: { type: Date, required: true },
    description: String
}, { timestamps: true });

transactionSchema.index({ user: 1, category: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);