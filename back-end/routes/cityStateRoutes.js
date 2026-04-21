const express = require("express");
const router = express.Router();
const cityStates = require("../data/cityStates");

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
        level: 5,
        name: "City Hall",
        category: "government",
        budget: 2550,
        spent: 1232,
        currentExp: 1500,
        expToNextLevel: 2000,
        savingGoal: "",
        history: [],
      },
      {
        type: "secondary",
        i: 2,
        location: { x: 500, y: 0 },
        level: 2,
        name: "Housing",
        category: "residential",
        budget: 700,
        spent: 320,
        currentExp: 100,
        expToNextLevel: 250,
        savingGoal: "$100",
        history: [
          "- $20 on dry-wall repair",
          "- $100 on air fryer",
        ],
      },
      {
        type: "secondary",
        i: 3,
        location: { x: 150, y: 475 },
        level: 1,
        name: "Food Market",
        category: "food",
        budget: 600,
        spent: 250,
        currentExp: 70,
        expToNextLevel: 100,
        savingGoal: "$50",
        history: [
          "- $45 on groceries",
          "- $15 on Taco Bell",
          "- $10 on coffee",
          "- $50 on hot pot",
        ],
      },
      {
        type: "secondary",
        i: 4,
        location: { x: -405, y: 294 },
        level: 4,
        name: "Hospital",
        category: "health",
        budget: 300,
        spent: 120,
        currentExp: 300,
        expToNextLevel: 750,
        savingGoal: "$50",
        history: [
          "- $50 on vitamins",
        ],
      },
      {
        type: "secondary",
        i: 5,
        location: { x: -405, y: -294 },
        level: 2,
        name: "School",
        category: "education",
        budget: 750,
        spent: 338,
        currentExp: 100,
        expToNextLevel: 250,
        savingGoal: "$30",
        history: [
          "- $120 on books",
          "- $18 on supplies",
        ],
      },
      {
        type: "secondary",
        i: 6,
        location: { x: 150, y: -475 },
        level: 3,
        name: "Cinema",
        category: "entertainment",
        budget: 200,
        spent: 104,
        currentExp: 175,
        expToNextLevel: 400,
        savingGoal: "$50",
        history: [
            "- $12 on movie tickets", 
            "- $18 on snacks"
        ],
      }
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

router.get("/:username", (req, res) => {
  const { username } = req.params;

  if (!username) {
    return res.status(400).json({ error: "Username is required" });
  }

  if (!cityStates[username]) {
    cityStates[username] = createDefaultCity();
  }

  return res.json(cityStates[username]);
});

router.put("/:username", (req, res) => {
  const { username } = req.params;
  const incomingCity = req.body;

  if (!username) {
    return res.status(400).json({ error: "Username is required" });
  }

  if (!incomingCity || typeof incomingCity !== "object") {
    return res.status(400).json({ error: "Invalid city state" });
  }

  const sanitizedCity = sanitizeCityState(incomingCity);
  cityStates[username] = sanitizedCity;

  return res.json({
    message: "City state saved successfully",
    city: sanitizedCity,
  });
});

module.exports = router;