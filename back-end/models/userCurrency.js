const mongoose = require('mongoose');

const userCurrencySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true,
    },
    currency: { type: Number, required: true, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('UserCurrency', userCurrencySchema);
