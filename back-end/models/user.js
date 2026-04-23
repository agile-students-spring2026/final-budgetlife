const mongoose = require("mongoose");

const playerStateSchema = new mongoose.Schema(
  {
    money: {
      type: Number,
      default: 1000,
      min: 0,
    },
    inventory: {
      type: [String],
      default: [],
    },
    equippedItems: {
      collar: { type: String, default: null },
      eyewear: { type: String, default: null },
      hat: { type: String, default: null },
      earring: { type: String, default: null },
    },
  },
  { _id: false }
);

const friendEntrySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    username: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    info: {
      type: String,
      default: "Friends for less than a day",
    },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      default: "",
      trim: true,
    },
    friends: {
      type: [friendEntrySchema],
      default: [],
    },
    playerState: {
      type: playerStateSchema,
      default: () => ({
        money: 1000,
        inventory: [],
        equippedItems: {
          collar: null,
          eyewear: null,
          hat: null,
          earring: null,
        },
      }),
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);