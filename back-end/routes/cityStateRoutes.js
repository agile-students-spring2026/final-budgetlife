const express = require("express");
const router = express.Router();
const requireAuth = require("../middleware/requireAuth");
const User = require("../models/user");
const City = require("../models/city");

function createDefaultCity() {
  return {
    version: 1,
    budgetRewardStatus: {
      claimedIntervals: {},
      currentStreak: 0,
      lastRewardedIntervalEndDate: null,
    },
    buildings: [
      {
        type: "primary",
        i: 1,
        location: { x: 0, y: 0 },
        level: 1,
        name: "City Hall",
        category: "government",
        budget: 0,
        spent: 0,
        currentExp: 0,
        expToNextLevel: 100,
        savingGoal: "",
        history: [],
      },
      {
        type: "secondary",
        i: 2,
        location: { x: 500, y: 0 },
        level: 1,
        name: "Housing",
        category: "residential",
        budget: 0,
        spent: 0,
        currentExp: 0,
        expToNextLevel: 100,
        savingGoal: "$100",
        history: [],
      },
      {
        type: "secondary",
        i: 3,
        location: { x: 150, y: 475 },
        level: 1,
        name: "Food Market",
        category: "food",
        budget: 0,
        spent: 0,
        currentExp: 0,
        expToNextLevel: 100,
        savingGoal: "$50",
        history: [],
      },
      {
        type: "secondary",
        i: 4,
        location: { x: -405, y: 294 },
        level: 1,
        name: "Hospital",
        category: "health",
        budget: 0,
        spent: 0,
        currentExp: 0,
        expToNextLevel: 100,
        savingGoal: "$50",
        history: [],
      },
      {
        type: "secondary",
        i: 5,
        location: { x: -405, y: -294 },
        level: 1,
        name: "School",
        category: "education",
        budget: 0,
        spent: 0,
        currentExp: 0,
        expToNextLevel: 100,
        savingGoal: "$30",
        history: [],
      },
      {
        type: "secondary",
        i: 6,
        location: { x: 150, y: -475 },
        level: 1,
        name: "Cinema",
        category: "entertainment",
        budget: 0,
        spent: 0,
        currentExp: 0,
        expToNextLevel: 100,
        savingGoal: "$50",
        history: [],
      },
    ],
    decorations: [],
  };
}

function sanitizeCityState(payload) {
  return {
    version: Number(payload?.version ?? 1),
    budgetRewardStatus: {
      claimedIntervals:
        payload?.budgetRewardStatus && typeof payload.budgetRewardStatus.claimedIntervals === "object"
          ? payload.budgetRewardStatus.claimedIntervals
          : {},
      currentStreak: Number(payload?.budgetRewardStatus?.currentStreak ?? 0),
      lastRewardedIntervalEndDate: payload?.budgetRewardStatus?.lastRewardedIntervalEndDate ?? null,
    },
    decorations: Array.isArray(payload?.decorations) ? payload.decorations : [],
    buildings: Array.isArray(payload?.buildings)
      ? payload.buildings.map((b) => ({
          type: b.type ?? "secondary",
          i: Number(b.i),
          location: {
            x: Number(b.location?.x ?? 0),
            y: Number(b.location?.y ?? 0),
          },
          level: Number(b.level ?? 1),
          name: b.name ?? "",
          category: b.category ?? "",
          budget: Number(b.budget ?? 0),
          spent: Number(b.spent ?? 0),
          currentExp: Number(b.currentExp ?? 0),
          expToNextLevel: Number(b.expToNextLevel ?? 0),
          savingGoal: b.savingGoal ?? "",
          history: Array.isArray(b.history) ? b.history : [],
        }))
      : [],
  };
}

router.get("/me", requireAuth, async (req, res) => {
  try {
    const username = req.user.username;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    let city = await City.findOne({ user: user._id });

    if (!city) {
      const defaults = createDefaultCity();
      city = await City.create({
        user: user._id,
        version: defaults.version,
        buildings: defaults.buildings,
        decorations: defaults.decorations,
      });
    }

    return res.json({
      version: city.version,
      buildings: city.buildings,
      decorations: city.decorations,
    });
  } catch (err) {
    console.error("Failed to fetch city state:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/me", requireAuth, async (req, res) => {
  try {
    const username = req.user.username;
    const incomingCity = req.body;

    if (!incomingCity || typeof incomingCity !== "object") {
      return res.status(400).json({ error: "Invalid city state" });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const sanitizedCity = sanitizeCityState(incomingCity);

    const city = await City.findOneAndUpdate(
      { user: user._id },
      {
        user: user._id,
        version: sanitizedCity.version,
        buildings: sanitizedCity.buildings,
        decorations: sanitizedCity.decorations,
      },
      {
        new: true,
        upsert: true,
      }
    );

    return res.json({
      message: "City state saved successfully",
      city: {
        version: city.version,
        buildings: city.buildings,
        decorations: city.decorations,
      },
    });
  } catch (err) {
    console.error("Failed to save city state:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;