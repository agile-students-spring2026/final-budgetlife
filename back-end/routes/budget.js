const express = require("express");
const router = express.Router();

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

// GET /api/budget/goals?currentUsername=alexr
router.get("/goals", (req, res) => {
    const { currentUsername } = req.query;
    if (!currentUsername) {
        return res.status(400).json({ error: "currentUsername is required" });
    }

    calculateCurrentAmount(currentUsername);
    const goals = getBudgetGoals(currentUsername);

    if (!goals) {
        return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({ goals });
});

// GET /api/budget/buildings?currentUsername=alexr
router.get("/buildings", (req, res) => {
    const { currentUsername } = req.query;
    if (!currentUsername) {
        return res.status(400).json({ error: "currentUsername is required" });
    }

    const health = getBuildingHealth(currentUsername);
    if (!health) {
        return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({ health });
});

// GET /api/budget/transactions?currentUsername=alexr
router.get("/transactions", (req, res) => {
    const { currentUsername } = req.query;
    if (!currentUsername) {
        return res.status(400).json({ error: "currentUsername is required" });
    }
    const transactions = getTransactionHistory(currentUsername);
    res.status(200).json({ transactions });
});

// POST /api/budget/transactions
// body: { currentUsername, category, amount, description?, date? }
router.post("/transactions", (req, res) => {
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

    addTransaction(
        currentUsername,
        category,
        date || new Date().toISOString().slice(0, 10),
        description || "",
        numericAmount
    );

    calculateCurrentAmount(currentUsername);
    const health = getBuildingHealth(currentUsername);
    const goals = getBudgetGoals(currentUsername);

    res.status(201).json({
        message: "Transaction added",
        health,
        goals,
    });
});

// PUT /api/budget/goals
// body: { currentUsername, category, goal }
router.put("/goals", (req, res) => {
    const { currentUsername, category, goal } = req.body;
    if (!currentUsername || !category || goal === undefined) {
        return res.status(400).json({
            error: "currentUsername, category, and goal are required",
        });
    }
    const ok = updateBudgetGoals(currentUsername, category, Number(goal));
    if (!ok) {
        return res.status(404).json({ error: "User or category not found" });
    }
    res.status(200).json({ message: "Goal updated" });
});

// PUT /api/budget/dates
// body: { currentUsername, startDate, endDate }
router.put("/dates", (req, res) => {
    const { currentUsername, startDate, endDate } = req.body;
    if (!currentUsername || !startDate || !endDate) {
        return res.status(400).json({
            error: "currentUsername, startDate, and endDate are required",
        });
    }
    const ok = updateBudgetGoalDates(currentUsername, startDate, endDate);
    if (!ok) {
        return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({ message: "Dates updated" });
});

// POST /api/budget/reward
// body: { currentUsername }
router.post("/reward", (req, res) => {
    const { currentUsername } = req.body;
    if (!currentUsername) {
        return res.status(400).json({ error: "currentUsername is required" });
    }
    const message = rewardUser(currentUsername);
    res.status(200).json({ message });
});

module.exports = router;
