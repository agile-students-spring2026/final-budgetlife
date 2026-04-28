const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
    goal: Number,
    current: Number
}, { _id: false });

const totalSchema = new mongoose.Schema({
    goal: Number,
    current: Number,
    startDate: String,
    endDate: String
}, { _id: false });

const goalSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true,
    },

    total: totalSchema,
    food: categorySchema,
    housing: categorySchema,
    health: categorySchema,
    entertainment: categorySchema

}, { timestamps: true });

module.exports = mongoose.model("Goal", goalSchema);