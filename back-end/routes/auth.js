const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const router = express.Router();
const User = require("../models/User");

function normalizePlayerState(playerState) {
  return {
    money: typeof playerState?.money === "number" ? playerState.money : 1000,
    inventory: Array.isArray(playerState?.inventory) ? playerState.inventory : [],
    equippedItems: {
      collar: playerState?.equippedItems?.collar || null,
      eyewear: playerState?.equippedItems?.eyewear || null,
      hat: playerState?.equippedItems?.hat || null,
      earring: playerState?.equippedItems?.earring || null,
    },
  };
}

function buildUserResponse(user) {
  return {
    id: user._id,
    username: user.username,
    email: user.email,
    playerState: normalizePlayerState(user.playerState),
  };
}

router.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const cleanedUsername = (username || "").trim().toLowerCase();
    const cleanedEmail = (email || "").trim().toLowerCase();
    const cleanedPassword = (password || "").trim();

    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!cleanedUsername || !usernameRegex.test(cleanedUsername)) {
      return res.status(400).json({ error: "Enter a valid username" });
    }

    if (!cleanedEmail || !emailRegex.test(cleanedEmail)) {
      return res.status(400).json({ error: "Enter a valid email" });
    }

    if (!cleanedPassword) {
      return res.status(400).json({ error: "Password is required" });
    }

    const existingUsername = await User.findOne({ username: cleanedUsername });
    if (existingUsername) {
      return res.status(409).json({ error: "Username already exists" });
    }

    const existingEmail = await User.findOne({ email: cleanedEmail });
    if (existingEmail) {
      return res.status(409).json({ error: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(cleanedPassword, 10);

    const newUser = await User.create({
      username: cleanedUsername,
      email: cleanedEmail,
      password: hashedPassword,
      friends: [],
    });

    const token = jwt.sign(
      { userId: newUser._id, username: newUser.username },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    res.status(201).json({
      message: "Signup successful",
      token,
      user: buildUserResponse(newUser),
    });
  } catch (err) {
    console.error("Signup failed:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { usernameOrEmail, password } = req.body;

    const cleanedLogin = (usernameOrEmail || "").trim().toLowerCase();
    const cleanedPassword = (password || "").trim();

    if (!cleanedLogin || !cleanedPassword) {
      return res.status(400).json({
        error: "Username/email and password are required",
      });
    }

    const user = await User.findOne({
      $or: [{ username: cleanedLogin }, { email: cleanedLogin }],
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid login credentials" });
    }

    const passwordMatches = await bcrypt.compare(
      cleanedPassword,
      user.password
    );

    if (!passwordMatches) {
      return res.status(401).json({ error: "Invalid login credentials" });
    }

    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: buildUserResponse(user),
    });
  } catch (err) {
    console.error("Login failed:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/username", async (req, res) => {
  try {
    const { currentUsername, newUsername } = req.body;

    const cleanedCurrent = (currentUsername || "").trim().toLowerCase();
    const cleanedNew = (newUsername || "").trim().toLowerCase();
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;

    if (!cleanedCurrent || !cleanedNew || !usernameRegex.test(cleanedNew)) {
      return res.status(400).json({ error: "Enter a valid username" });
    }

    const user = await User.findOne({ username: cleanedCurrent });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const existing = await User.findOne({ username: cleanedNew });
    if (existing && String(existing._id) !== String(user._id)) {
      return res.status(409).json({ error: "Username already exists" });
    }

    user.username = cleanedNew;
    await user.save();

    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    res.status(200).json({
      message: "Username updated",
      user: buildUserResponse(user),
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Username update failed:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/email", async (req, res) => {
  try {
    const { currentUsername, newEmail } = req.body;

    const cleanedCurrent = (currentUsername || "").trim().toLowerCase();
    const cleanedEmail = (newEmail || "").trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!cleanedCurrent || !cleanedEmail || !emailRegex.test(cleanedEmail)) {
      return res.status(400).json({ error: "Enter a valid email" });
    }

    const user = await User.findOne({ username: cleanedCurrent });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const existing = await User.findOne({ email: cleanedEmail });
    if (existing && String(existing._id) !== String(user._id)) {
      return res.status(409).json({ error: "Email already exists" });
    }

    user.email = cleanedEmail;
    await user.save();

    res.status(200).json({
      message: "Email updated",
      user: buildUserResponse(user),
    });
  } catch (err) {
    console.error("Email update failed:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/password", async (req, res) => {
  try {
    const { currentUsername, oldPassword, newPassword } = req.body;

    const cleanedCurrent = (currentUsername || "").trim().toLowerCase();
    const cleanedOld = (oldPassword || "").trim();
    const cleanedNew = (newPassword || "").trim();

    if (!cleanedCurrent || !cleanedOld || !cleanedNew) {
      return res.status(400).json({ error: "All password fields are required" });
    }

    const user = await User.findOne({ username: cleanedCurrent });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const passwordMatches = await bcrypt.compare(cleanedOld, user.password);
    if (!passwordMatches) {
      return res.status(401).json({ error: "Old password is incorrect" });
    }

    user.password = await bcrypt.hash(cleanedNew, 10);
    await user.save();

    res.status(200).json({
      message: "Password updated",
    });
  } catch (err) {
    console.error("Password update failed:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/account", async (req, res) => {
  try {
    const { currentUsername } = req.body;

    const cleanedCurrent = (currentUsername || "").trim().toLowerCase();

    if (!cleanedCurrent) {
      return res.status(400).json({ error: "User not found" });
    }

    const deletedUser = await User.findOneAndDelete({ username: cleanedCurrent });

    if (!deletedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({
      message: "Account deleted",
    });
  } catch (err) {
    console.error("Delete account failed:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/player-state", async (req, res) => {
  try {
    const cleanedCurrent = (req.query.currentUsername || "").trim().toLowerCase();

    if (!cleanedCurrent) {
      return res.status(400).json({ error: "currentUsername is required" });
    }

    const user = await User.findOne({ username: cleanedCurrent });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({ playerState: normalizePlayerState(user.playerState) });
  } catch (err) {
    console.error("Get player state failed:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/player-state", async (req, res) => {
  try {
    const cleanedCurrent = (req.body.currentUsername || "").trim().toLowerCase();

    if (!cleanedCurrent) {
      return res.status(400).json({ error: "currentUsername is required" });
    }

    const user = await User.findOne({ username: cleanedCurrent });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.playerState = normalizePlayerState(req.body.playerState);
    await user.save();

    return res.status(200).json({
      message: "Player state updated",
      playerState: normalizePlayerState(user.playerState),
    });
  } catch (err) {
    console.error("Update player state failed:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;