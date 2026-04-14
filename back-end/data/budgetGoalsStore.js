const { addUserCurrency } = require("./shop");
const { getTransactionHistory } = require("./transaction");


const budgetGoals = {
    alexr: {
        total: { goal: 10000 , current: 5000 , startDate: '2026-01-01', endDate: '2026-12-31' },
        food: { goal: 2000, current: 1000 },
        housing: { goal: 4000, current: 2000 },
        health: { goal: 3000, current: 1500 },
        entertainment: { goal: 1000, current: 500 },
    },
    jordy88: {
        total: { goal: 5000, current: 2500, startDate: '2026-01-02', endDate: '2026-03-31' },
        food: { goal: 1000, current: 500 },
        housing: { goal: 2000, current: 1000 },
        health: { goal: 1000, current: 500 },
        entertainment: { goal: 1000, current: 500 },
    },
    caseybuilds: {
        total: { goal: 7000, current: 3500, startDate: '2026-01-03', endDate: '2026-02-28' },
        food: { goal: 2000, current: 1000 },
        housing: { goal: 3000, current: 1500 },
        health: { goal: 500, current: 250 },
        entertainment: { goal: 1500, current: 750 },
    },
    taylortracks: {
        total: { goal: 7000, current: 3500, startDate: '2026-01-04', endDate: '2026-01-31' },
        food: { goal: 2000, current: 1000 },
        housing: { goal: 3000, current: 1500 },
        health: { goal: 500, current: 250 },
        entertainment: { goal: 1500, current: 750 },
    },
    morgmoney: {
        total: { goal: 7000, current: 3500, startDate: '2026-01-05', endDate: '2026-03-31' },
        food: { goal: 2000, current: 1000 },
        housing: { goal: 3000, current: 1500 },
        health: { goal: 500, current: 250 },
        entertainment: { goal: 1500, current: 750 },
    },
    rileybudgets: {
        total: { goal: 7000, current: 3500, startDate: '2026-01-06', endDate: '2026-05-31' },
        food: { goal: 2000, current: 1000 },
        housing: { goal: 3000, current: 1500 },
        health: { goal: 500, current: 250 },
        entertainment: { goal: 1500, current: 750 },
    },
    jamiecity: {
        total: { goal: 7000, current: 3500, startDate: '2026-01-07', endDate: '2026-06-30' },
        food: { goal: 2000, current: 1000 },
        housing: { goal: 3000, current: 1500 },
        health: { goal: 500, current: 250 },
        entertainment: { goal: 1500, current: 750 },
    },
    averyplays: {
        total: { goal: 7000, current: 3500, startDate: '2026-01-08', endDate: '2026-07-31' },
        food: { goal: 2000, current: 1000 },
        housing: { goal: 3000, current: 1500 },
        health: { goal: 500, current: 250 },
        entertainment: { goal: 1500, current: 750 },
    },
    parkerplans: {
        total: { goal: 7000, current: 3500, startDate: '2026-01-09', endDate: '2026-08-31' },
        food: { goal: 2000, current: 1000 },
        housing: { goal: 3000, current: 1500 },
        health: { goal: 500, current: 250 },
        entertainment: { goal: 1500, current: 750 },
    },
    skylerstacks: {
        total: { goal: 7000, current: 3500, startDate: '2026-01-10', endDate: '2026-09-30' },
        food: { goal: 2000, current: 1000 },
        housing: { goal: 3000, current: 1500 },
        health: { goal: 500, current: 250 },
        entertainment: { goal: 1500, current: 750 },
    },
};

let budgetGoalsCopy = JSON.parse(JSON.stringify(budgetGoals));

function getBudgetGoals(username) {
    return budgetGoalsCopy[username] || null;
}

function updateBudgetGoals(username, category, newGoal) {
    if (budgetGoalsCopy[username] && budgetGoalsCopy[username][category]) {
        budgetGoalsCopy[username][category].goal = newGoal;
        return true;
    }
    return false;
}

function updateCurrentAmount(username, category, newCurrent) {
    if (budgetGoalsCopy[username] && budgetGoalsCopy[username][category]) {
        budgetGoalsCopy[username][category].current = newCurrent;
        return true;
    }
    return false;
}

function resetBudgetGoals() {
    budgetGoalsCopy = JSON.parse(JSON.stringify(budgetGoals));
}

function addUserBudgetGoals(username) {
    if (!budgetGoalsCopy[username]) {
        budgetGoalsCopy[username] = {
            total: { goal: 0, current: 0, startDate: null, endDate: null },
            food: { goal: 0, current: 0 },
            housing: { goal: 0, current: 0 },
            health: { goal: 0, current: 0 },
            entertainment: { goal: 0, current: 0 },
        };
        return true;
    }
    return false;
}

function deleteUserBudgetGoals(username) {
    if (budgetGoalsCopy[username]) {
        delete budgetGoalsCopy[username];
        return true;
    }
    return false;
}

function updateBudgetGoalDates(username, startDate, endDate) {
    if (budgetGoalsCopy[username] && budgetGoalsCopy[username].total) {
        budgetGoalsCopy[username].total.startDate = startDate;
        budgetGoalsCopy[username].total.endDate = endDate;
        return true;
    }
    return false;
}

function calculateCurrentAmount(username) {
    if (!budgetGoalsCopy[username]) return;
    const transactions = getTransactionHistory(username);

    // reset per-category currents so deletes/updates are reflected
    for (const cat of ['food', 'housing', 'health', 'entertainment']) {
        if (budgetGoalsCopy[username][cat]) {
            budgetGoalsCopy[username][cat].current = 0;
        }
    }

    let totalCurrent = 0;
    for (const category in transactions) {
        let categoryCurrent = 0;
        for (const transactionId in transactions[category]) {
            const amt = transactions[category][transactionId].amount;
            categoryCurrent += amt;
            totalCurrent += amt;
        }
        if (budgetGoalsCopy[username][category]) {
            budgetGoalsCopy[username][category].current = categoryCurrent;
        }
    }

    if (budgetGoalsCopy[username].total) {
        budgetGoalsCopy[username].total.current = totalCurrent;
    }
}

const CATEGORY_TO_BUILDING = {
    total:         'cityhall',
    housing:       'houses',
    food:          'restaurant',
    health:        'hospital',
    entertainment: 'cinema',
};

function getBuildingHealth(username) {
    if (!budgetGoalsCopy[username]) return null;
    calculateCurrentAmount(username);

    const result = {};
    for (const [category, building] of Object.entries(CATEGORY_TO_BUILDING)) {
        const entry = budgetGoalsCopy[username][category];
        if (!entry || !entry.goal) {
            result[building] = 100;
            continue;
        }
        const remaining = entry.goal - entry.current;
        const pct = Math.round((remaining / entry.goal) * 100);
        result[building] = Math.max(0, Math.min(100, pct));
    }
    return result;
}

function rewardUser(username) {
    if (budgetGoalsCopy[username] && budgetGoalsCopy[username].total) {
        calculateCurrentAmount(username);
        const totalGoal = budgetGoalsCopy[username].total.goal;
        const totalCurrent = budgetGoalsCopy[username].total.current;
        if (totalCurrent <= totalGoal && new Date() >= new Date(budgetGoalsCopy[username].total.endDate)) {
            let added = totalGoal - totalCurrent;
            addUserCurrency(username, added)
            return "Congratulations! You've met your budget goal!";
        } else {
            return "Keep going! You're doing great!";
        }
    }
    return "User not found.";
}

module.exports = {
    getBudgetGoals,
    updateBudgetGoals,
    updateCurrentAmount,
    resetBudgetGoals,
    addUserBudgetGoals,
    deleteUserBudgetGoals,
    updateBudgetGoalDates,
    calculateCurrentAmount,
    rewardUser,
    getBuildingHealth,
};