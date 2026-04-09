const budgetGoals = {
    alex: {
        total: { goal: 10000 , current: 5000 },
        food: { goal: 2000, current: 1000 },
        housing: { goal: 4000, current: 2000 },
        health: { goal: 3000, current: 1500 },
        Entertainment: { goal: 1000, current: 500 },
    },
    jordy88: {
        total: { goal: 5000, current: 2500 },
        food: { goal: 1000, current: 500 },
        housing: { goal: 2000, current: 1000 },
        health: { goal: 1000, current: 500 },
        Entertainment: { goal: 1000, current: 500 },
    },
    caseybuilds: {
        total: { goal: 7000, current: 3500 },
        food: { goal: 2000, current: 1000 },
        housing: { goal: 3000, current: 1500 },
        health: { goal: 500, current: 250 },
        Entertainment: { goal: 1500, current: 750 },
    },
    taylortracks: {
        total: { goal: 7000, current: 3500 },
        food: { goal: 2000, current: 1000 },
        housing: { goal: 3000, current: 1500 },
        health: { goal: 500, current: 250 },
        Entertainment: { goal: 1500, current: 750 },
    },
    morgmoney: {
        total: { goal: 7000, current: 3500 },
        food: { goal: 2000, current: 1000 },
        housing: { goal: 3000, current: 1500 },
        health: { goal: 500, current: 250 },
        Entertainment: { goal: 1500, current: 750 },
    },
    rileybudgets: {
        total: { goal: 7000, current: 3500 },
        food: { goal: 2000, current: 1000 },
        housing: { goal: 3000, current: 1500 },
        health: { goal: 500, current: 250 },
        Entertainment: { goal: 1500, current: 750 },
    },
    jamiecity: {
        total: { goal: 7000, current: 3500 },
        food: { goal: 2000, current: 1000 },
        housing: { goal: 3000, current: 1500 },
        health: { goal: 500, current: 250 },
        Entertainment: { goal: 1500, current: 750 },
    },
    averyplays: {
        total: { goal: 7000, current: 3500 },
        food: { goal: 2000, current: 1000 },
        housing: { goal: 3000, current: 1500 },
        health: { goal: 500, current: 250 },
        Entertainment: { goal: 1500, current: 750 },
    },
    parkerplans: {
        total: { goal: 7000, current: 3500 },
        food: { goal: 2000, current: 1000 },
        housing: { goal: 3000, current: 1500 },
        health: { goal: 500, current: 250 },
        Entertainment: { goal: 1500, current: 750 },
    },
    skylerstacks: {
        total: { goal: 7000, current: 3500 },
        food: { goal: 2000, current: 1000 },
        housing: { goal: 3000, current: 1500 },
        health: { goal: 500, current: 250 },
        Entertainment: { goal: 1500, current: 750 },
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

module.exports = {
    getBudgetGoals,
    updateBudgetGoals,
    updateCurrentAmount,
};