const budgetGoals = {
    alex: {
        total: { goal: 10000 , current: 5000 , startDate: '2026-01-01', endDate: '2026-12-31' },
        food: { goal: 2000, current: 1000 },
        housing: { goal: 4000, current: 2000 },
        health: { goal: 3000, current: 1500 },
        entertainment: { goal: 1000, current: 500 },
    },
    jordy88: {
        total: { goal: 5000, current: 2500, startDate: '2026-01-02', endDate: '2026-3-31' },
        food: { goal: 1000, current: 500 },
        housing: { goal: 2000, current: 1000 },
        health: { goal: 1000, current: 500 },
        entertainment: { goal: 1000, current: 500 },
    },
    caseybuilds: {
        total: { goal: 7000, current: 3500, startDate: '2026-01-03', endDate: '2026-2-28' },
        food: { goal: 2000, current: 1000 },
        housing: { goal: 3000, current: 1500 },
        health: { goal: 500, current: 250 },
        entertainment: { goal: 1500, current: 750 },
    },
    taylortracks: {
        total: { goal: 7000, current: 3500, startDate: '2026-01-04', endDate: '2026-1-31' },
        food: { goal: 2000, current: 1000 },
        housing: { goal: 3000, current: 1500 },
        health: { goal: 500, current: 250 },
        entertainment: { goal: 1500, current: 750 },
    },
    morgmoney: {
        total: { goal: 7000, current: 3500, startDate: '2026-01-05', endDate: '2026-3-31' },
        food: { goal: 2000, current: 1000 },
        housing: { goal: 3000, current: 1500 },
        health: { goal: 500, current: 250 },
        entertainment: { goal: 1500, current: 750 },
    },
    rileybudgets: {
        total: { goal: 7000, current: 3500, startDate: '2026-01-06', endDate: '2026-5-31' },
        food: { goal: 2000, current: 1000 },
        housing: { goal: 3000, current: 1500 },
        health: { goal: 500, current: 250 },
        entertainment: { goal: 1500, current: 750 },
    },
    jamiecity: {
        total: { goal: 7000, current: 3500, startDate: '2026-01-07', endDate: '2026-6-30' },
        food: { goal: 2000, current: 1000 },
        housing: { goal: 3000, current: 1500 },
        health: { goal: 500, current: 250 },
        entertainment: { goal: 1500, current: 750 },
    },
    averyplays: {
        total: { goal: 7000, current: 3500, startDate: '2026-01-08', endDate: '2026-7-31' },
        food: { goal: 2000, current: 1000 },
        housing: { goal: 3000, current: 1500 },
        health: { goal: 500, current: 250 },
        entertainment: { goal: 1500, current: 750 },
    },
    parkerplans: {
        total: { goal: 7000, current: 3500, startDate: '2026-01-09', endDate: '2026-8-31' },
        food: { goal: 2000, current: 1000 },
        housing: { goal: 3000, current: 1500 },
        health: { goal: 500, current: 250 },
        entertainment: { goal: 1500, current: 750 },
    },
    skylerstacks: {
        total: { goal: 7000, current: 3500, startDate: '2026-01-10', endDate: '2026-9-30' },
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

module.exports = {
    getBudgetGoals,
    updateBudgetGoals,
    updateCurrentAmount,
    resetBudgetGoals,
    addUserBudgetGoals,
    deleteUserBudgetGoals,
    updateBudgetGoalDates,
};