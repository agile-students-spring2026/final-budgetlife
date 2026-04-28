const Transaction = require("../models/transaction");

async function getTransactionHistory(userId) {
    const docs = await Transaction.find({ user: userId });
    const grouped = {};
    for (const doc of docs) {
        if (!grouped[doc.category]) grouped[doc.category] = {};
        grouped[doc.category][doc._id.toString()] = {
            id: doc._id.toString(),
            date: doc.date,
            description: doc.description,
            amount: doc.amount,
        };
    }
    return grouped;
}

async function addTransaction(userId, category, date, description, amount) {
    return await Transaction.create({
        user: userId,
        category,
        date,
        description,
        amount,
    });
}

async function updateTransaction(userId, category, transactionId, date, description, amount) {
    const txn = await Transaction.findOne({ _id: transactionId, user: userId, category });
    if (!txn) return false;
    txn.date = date;
    txn.description = description;
    txn.amount = amount;
    await txn.save();
    return true;
}

async function deleteTransaction(userId, category, transactionId) {
    const result = await Transaction.findOneAndDelete({
        _id: transactionId,
        user: userId,
        category,
    });
    return result !== null;
}

module.exports = {
    getTransactionHistory,
    addTransaction,
    updateTransaction,
    deleteTransaction,
};
