const express = require("express");
const router = express.Router();

const User = require("../models/User");

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

async function resolveUserId(username) {
    if (!username) return null;
    const user = await User.findOne({ username: username.trim().toLowerCase() }).select("_id").lean();
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
        res.status(200).json({ goals });
    } catch (err) {
        console.error("GET /goals failed:", err);
        res.status(500).json({ error: "Internal server error" });
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
        res.status(200).json({ health });
    } catch (err) {
        console.error("GET /buildings failed:", err);
        res.status(500).json({ error: "Internal server error" });
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
        res.status(200).json({ transactions });
    } catch (err) {
        console.error("GET /transactions failed:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// POST /api/budget/transactions
// body: { currentUsername, category, amount, description?, date? }
router.post("/transactions", async (req, res) => {
    try {
        const { currentUsername, category, amount, description, date } = req.body;

        if (!currentUsername || !category || amount === undefined) {
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

        const userId = await resolveUserId(currentUsername);
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

        res.status(201).json({
            message: "Transaction added",
            health,
            goals,
        });
    } catch (err) {
        console.error("POST /transactions failed:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// PUT /api/budget/goals
// body: { currentUsername, category, goal }
router.put("/goals", async (req, res) => {
    try {
        const { currentUsername, category, goal } = req.body;
        if (!currentUsername || !category || goal === undefined) {
            return res.status(400).json({
                error: "currentUsername, category, and goal are required",
            });
        }

        const userId = await resolveUserId(currentUsername);
        if (!userId) {
            return res.status(404).json({ error: "User not found" });
        }

        const ok = await updateBudgetGoals(userId, category, Number(goal));
        if (!ok) {
            return res.status(404).json({ error: "Goal or category not found" });
        }
        res.status(200).json({ message: "Goal updated" });
    } catch (err) {
        console.error("PUT /goals failed:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// PUT /api/budget/dates
// body: { currentUsername, startDate, endDate }
router.put("/dates", async (req, res) => {
    try {
        const { currentUsername, startDate, endDate } = req.body;
        if (!currentUsername || !startDate || !endDate) {
            return res.status(400).json({
                error: "currentUsername, startDate, and endDate are required",
            });
        }

        const userId = await resolveUserId(currentUsername);
        if (!userId) {
            return res.status(404).json({ error: "User not found" });
        }

        const ok = await updateBudgetGoalDates(userId, startDate, endDate);
        if (!ok) {
            return res.status(404).json({ error: "Goal not found" });
        }
        res.status(200).json({ message: "Dates updated" });
    } catch (err) {
        console.error("PUT /dates failed:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// POST /api/budget/goals/init  (new-user onboarding)
// body: { currentUsername, food, housing, health, entertainment, startDate, endDate }
// total.goal is computed as the sum of the four category goals
router.post("/goals/init", async (req, res) => {
    try {
        const { currentUsername, food, housing, health, entertainment, startDate, endDate } = req.body;

        if (!currentUsername || !startDate || !endDate) {
            return res.status(400).json({ error: "currentUsername, startDate, and endDate are required" });
        }

        const categoryGoals = { food, housing, health, entertainment };
        for (const [cat, val] of Object.entries(categoryGoals)) {
            const num = Number(val);
            if (!Number.isFinite(num) || num < 0) {
                return res.status(400).json({ error: `${cat} must be a non-negative number` });
            }
            categoryGoals[cat] = num;
        }

        const userId = await resolveUserId(currentUsername);
        if (!userId) {
            return res.status(404).json({ error: "User not found" });
        }

        const existing = await Goal.findOne({ user: userId });
        if (existing) {
            return res.status(409).json({ error: "Budget goals already initialized" });
        }

        const totalGoal = categoryGoals.food + categoryGoals.housing + categoryGoals.health + categoryGoals.entertainment;

        const goal = await Goal.create({
            user: userId,
            total: { goal: totalGoal, current: 0, startDate, endDate },
            food:          { goal: categoryGoals.food, current: 0 },
            housing:       { goal: categoryGoals.housing, current: 0 },
            health:        { goal: categoryGoals.health, current: 0 },
            entertainment: { goal: categoryGoals.entertainment, current: 0 },
        });

        res.status(201).json({ message: "Budget goals initialized", goals: goal });
    } catch (err) {
        console.error("POST /goals/init failed:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// POST /api/budget/reward
// body: { currentUsername }
router.post("/reward", async (req, res) => {
    try {
        const { currentUsername } = req.body;
        if (!currentUsername) {
            return res.status(400).json({ error: "currentUsername is required" });
        }

        const userId = await resolveUserId(currentUsername);
        if (!userId) {
            return res.status(404).json({ error: "User not found" });
        }

        const reward = await rewardUser(userId);
        res.status(200).json(reward);
    } catch (err) {
        console.error("POST /reward failed:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;
