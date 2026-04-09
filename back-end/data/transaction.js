const transactionHistory = {
    alexr: {
        food:          { transaction1: { id: 1, date: '2026-01-01', description: 'Grocery shopping', amount: 150 } },
        housing:       { transaction1: { id: 2, date: '2026-01-05', description: 'Rent payment',     amount: 2000 } },
        health:        { transaction1: { id: 4, date: '2026-01-10', description: 'Doctor visit',     amount: 100 } },
        entertainment: { transaction1: { id: 3, date: '2026-01-15', description: 'Movie tickets',    amount: 50 } },
    },
    jordy88: {
        food:          { transaction1: { id: 4, date: '2026-01-01', description: 'Grocery shopping', amount: 250 } },
        housing:       { transaction1: { id: 3, date: '2026-01-05', description: 'Rent payment',     amount: 1000 } },
        health:        { transaction1: { id: 1, date: '2026-01-10', description: 'Doctor visit',     amount: 1000 } },
        entertainment: { transaction1: { id: 2, date: '2026-01-15', description: 'Movie tickets',    amount: 250 } },
    },
    caseybuilds: {
        food:          { transaction1: { id: 2, date: '2026-01-01', description: 'Grocery shopping', amount: 1000 } },
        housing:       { transaction1: { id: 1, date: '2026-01-05', description: 'Rent payment',     amount: 1500 } },
        health:        { transaction1: { id: 3, date: '2026-01-10', description: 'Doctor visit',     amount: 250 } },
        entertainment: { transaction1: { id: 4, date: '2026-01-15', description: 'Movie tickets',    amount: 750 } },
    },
    taylortracks: {},
    morgmoney: {},
    rileybudgets: {},
    jamiecity: {},
    averyplays: {},
    parkerplans: {},
    skylerstacks: {},
};

function getTransactionHistory(username) {
    return transactionHistory[username] || {};
}

function addTransaction(username, category, date, description, amount) {
    if (!transactionHistory[username]) {
        transactionHistory[username] = {};
    }
    if (!transactionHistory[username][category]) {
        transactionHistory[username][category] = {};
    }
    const transactionId = `transaction${Object.keys(transactionHistory[username][category]).length + 1}`;
    transactionHistory[username][category][transactionId] = { date, description, amount };
}

function updateTransaction(username, category, transactionId, date, description, amount) {
    if (transactionHistory[username] && transactionHistory[username][category] && transactionHistory[username][category][transactionId]) {
        transactionHistory[username][category][transactionId] = { date, description, amount };
    }
}

function deleteTransaction(username, category, transactionId) {
    if (transactionHistory[username] && transactionHistory[username][category] && transactionHistory[username][category][transactionId]) {
        delete transactionHistory[username][category][transactionId];
    }
}

module.exports = {
    getTransactionHistory,
    addTransaction,
    updateTransaction,
    deleteTransaction,
};