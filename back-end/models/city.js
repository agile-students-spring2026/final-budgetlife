const mongoose = require("mongoose");

const buildingSchema = new mongoose.Schema(
  {
    type: String,
    i: Number,
    location: {
      x: Number,
      y: Number,
    },
    level: Number,
    name: String,
    category: String,
    budget: Number,
    spent: Number,
    currentExp: Number,
    expToNextLevel: Number,
    savingGoal: String,
    history: [String],
  },
  { _id: false }
);

const citySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    version: {
      type: Number,
      default: 1,
    },
    buildings: {
      type: [buildingSchema],
      default: [],
    },
    decorations: {
      type: Array,
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("City", citySchema);