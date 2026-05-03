const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const User = require("../models/user");
const Goal = require("../models/budgetGoal");

const {
  getBudgetGoals,
  updateBudgetGoals,
  updateBudgetGoalDates,
  calculateCurrentAmount,
  getBuildingHealth,
  rewardUser,
} = require("../data/budgetGoalsStore");

const {
  addTransaction,
  getTransactionHistory,
} = require("../data/transaction");

const VALID_CATEGORIES = ["food", "housing", "health", "entertainment"];

function getUsernameFromBody(body) {
  const value =
    body.currentUsername ||
    body.currentUserName ||
    body.username ||
    body.userName ||
    body.user ||
    body.userId ||
    body.id ||
    body.currentUser ||
    body.current_user ||
    body.current_user_name ||
    body.name ||
    body.email;

  if (!value) return null;

  if (typeof value === "object") {
    return (
      value.currentUsername ||
      value.currentUserName ||
      value.username ||
      value.userName ||
      value.userId ||
      value.id ||
      value._id ||
      value.email ||
      value.name ||
      null
    );
  }

  return String(value);
}

async function resolveUserId(value) {
  if (!value) return null;

  let rawValue = value;

  if (typeof rawValue === "object") {
    rawValue =
      rawValue._id ||
      rawValue.id ||
      rawValue.userId ||
      rawValue.username ||
      rawValue.userName ||
      rawValue.currentUsername ||
      rawValue.currentUserName ||
      rawValue.email ||
      rawValue.name;
  }

  if (!rawValue) return null;

  const textValue = String(rawValue).trim();

  if (mongoose.Types.ObjectId.isValid(textValue)) {
    const userById = await User.findById(textValue).select("_id").lean();

    if (userById) {
      return userById._id;
    }
  }

  const lowerValue = textValue.toLowerCase();

  const user = await User.findOne({
    $or: [
      { username: lowerValue },
      { email: lowerValue },
      { name: textValue },
    ],
  })
    .select("_id")
    .lean();

  return user ? user._id : null;
}

// GET /api/budget/goals?currentUsername=alexr
router.get("/goals", async (req, res) => {
  try {
    const { currentUsername } = req.query;

    if (!currentUsername) {
      return res.status(400).json({ error: "currentUsername is required" });
    }

    const userId = await resolveUserId(currentUsername);

    if (!userId) {
      return res.status(404).json({ error: "User not found" });
    }

    await calculateCurrentAmount(userId);

    const goals = await getBudgetGoals(userId);

    if (!goals) {
      return res.status(404).json({ error: "Goals not found" });
    }

    return res.status(200).json({ goals });
  } catch (err) {
    console.error("GET /goals failed:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/budget/buildings?currentUsername=alexr
router.get("/buildings", async (req, res) => {
  try {
    const { currentUsername } = req.query;

    if (!currentUsername) {
      return res.status(400).json({ error: "currentUsername is required" });
    }

    const userId = await resolveUserId(currentUsername);

    if (!userId) {
      return res.status(404).json({ error: "User not found" });
    }

    const health = await getBuildingHealth(userId);

    if (!health) {
      return res.status(404).json({ error: "Goals not found" });
    }

    return res.status(200).json({ health });
  } catch (err) {
    console.error("GET /buildings failed:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/budget/transactions?currentUsername=alexr
router.get("/transactions", async (req, res) => {
  try {
    const { currentUsername } = req.query;

    if (!currentUsername) {
      return res.status(400).json({ error: "currentUsername is required" });
    }

    const userId = await resolveUserId(currentUsername);

    if (!userId) {
      return res.status(404).json({ error: "User not found" });
    }

    const transactions = await getTransactionHistory(userId);

    return res.status(200).json({ transactions });
  } catch (err) {
    console.error("GET /transactions failed:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/budget/transactions
router.post("/transactions", async (req, res) => {
  try {
    const username = getUsernameFromBody(req.body);
    const { category, amount, description, date } = req.body;

    if (!username || !category || amount === undefined) {
      return res.status(400).json({
        error: "currentUsername, category, and amount are required",
      });
    }

    if (!VALID_CATEGORIES.includes(category)) {
      return res.status(400).json({
        error: `category must be one of: ${VALID_CATEGORIES.join(", ")}`,
      });
    }

    const numericAmount = Number(amount);

    if (Number.isNaN(numericAmount)) {
      return res.status(400).json({ error: "amount must be a number" });
    }

    const userId = await resolveUserId(username);

    if (!userId) {
      return res.status(404).json({ error: "User not found" });
    }

    await addTransaction(
      userId,
      category,
      date || new Date().toISOString().slice(0, 10),
      description || "",
      numericAmount
    );

    await calculateCurrentAmount(userId);

    const health = await getBuildingHealth(userId);
    const goals = await getBudgetGoals(userId);

    return res.status(201).json({
      message: "Transaction added",
      health,
      goals,
    });
  } catch (err) {
    console.error("POST /transactions failed:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /api/budget/goals
router.put("/goals", async (req, res) => {
  try {
    const username = getUsernameFromBody(req.body);
    const { category, goal } = req.body;

    if (!username || !category || goal === undefined) {
      return res.status(400).json({
        error: "currentUsername, category, and goal are required",
      });
    }

    const userId = await resolveUserId(username);

    if (!userId) {
      return res.status(404).json({ error: "User not found" });
    }

    const ok = await updateBudgetGoals(userId, category, Number(goal));

    if (!ok) {
      return res.status(404).json({ error: "Goal or category not found" });
    }

    return res.status(200).json({ message: "Goal updated" });
  } catch (err) {
    console.error("PUT /goals failed:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /api/budget/dates
router.put("/dates", async (req, res) => {
  try {
    const username = getUsernameFromBody(req.body);
    const { startDate, endDate } = req.body;

    if (!username || !startDate || !endDate) {
      return res.status(400).json({
        error: "currentUsername, startDate, and endDate are required",
      });
    }

    const userId = await resolveUserId(username);

    if (!userId) {
      return res.status(404).json({ error: "User not found" });
    }

    const ok = await updateBudgetGoalDates(userId, startDate, endDate);

    if (!ok) {
      return res.status(404).json({ error: "Goal not found" });
    }

    return res.status(200).json({ message: "Dates updated" });
  } catch (err) {
    console.error("PUT /dates failed:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/budget/goals/init
router.post("/goals/init", async (req, res) => {
  try {
    const username = getUsernameFromBody(req.body);
    const {
      food,
      housing,
      health,
      entertainment,
      startDate,
      endDate,
    } = req.body;

    if (!username || !startDate || !endDate) {
      return res.status(400).json({
        error: "currentUsername, startDate, and endDate are required",
      });
    }

    const categoryGoals = { food, housing, health, entertainment };

    for (const [cat, val] of Object.entries(categoryGoals)) {
      const num = Number(val);

      if (!Number.isFinite(num) || num < 0) {
        return res.status(400).json({
          error: `${cat} must be a non-negative number`,
        });
      }

      categoryGoals[cat] = num;
    }

    const userId = await resolveUserId(username);

    if (!userId) {
      return res.status(404).json({ error: "User not found" });
    }

    const existing = await Goal.findOne({ user: userId });

    if (existing) {
      return res.status(409).json({
        error: "Budget goals already initialized",
      });
    }

    const totalGoal =
      categoryGoals.food +
      categoryGoals.housing +
      categoryGoals.health +
      categoryGoals.entertainment;

    const goal = await Goal.create({
      user: userId,
      total: { goal: totalGoal, current: 0, startDate, endDate },
      food: { goal: categoryGoals.food, current: 0 },
      housing: { goal: categoryGoals.housing, current: 0 },
      health: { goal: categoryGoals.health, current: 0 },
      entertainment: { goal: categoryGoals.entertainment, current: 0 },
    });

    return res.status(201).json({
      message: "Budget goals initialized",
      goals: goal,
    });
  } catch (err) {
    console.error("POST /goals/init failed:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/budget/reward
router.post("/reward", async (req, res) => {
  try {
    const username = getUsernameFromBody(req.body);

    if (!username) {
      return res.status(400).json({ error: "currentUsername is required" });
    }

    const userId = await resolveUserId(username);

    if (!userId) {
      return res.status(404).json({ error: "User not found" });
    }

    const reward = await rewardUser(userId);

    return res.status(200).json(reward);
  } catch (err) {
    console.error("POST /reward failed:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;