const mongoose = require("mongoose");
const Transaction = require("../models/transaction");
const User = require("../models/user");

const deletedLegacyIdsByUserCategory = new Map();

async function resolveUserId(usernameOrId) {
  if (!usernameOrId) return null;

  if (mongoose.Types.ObjectId.isValid(usernameOrId)) {
    return usernameOrId;
  }

  let rawValue = usernameOrId;

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

function deletedKey(userId, category) {
  return `${String(userId)}:${category}`;
}

function getDeletedLegacyIds(userId, category) {
  const key = deletedKey(userId, category);

  if (!deletedLegacyIdsByUserCategory.has(key)) {
    deletedLegacyIdsByUserCategory.set(key, new Set());
  }

  return deletedLegacyIdsByUserCategory.get(key);
}

async function getSortedTransactions(userId, category = null) {
  const query = { user: userId };

  if (category) {
    query.category = category;
  }

  return await Transaction.find(query).sort({ createdAt: 1, _id: 1 });
}

function legacyTransactionKey(index) {
  return `transaction${index + 1}`;
}

async function resolveTransactionDoc(userId, category, transactionId) {
  if (!userId || !category || !transactionId) return null;

  const legacyMatch = String(transactionId).match(/^transaction(\d+)$/);

  if (legacyMatch) {
    const index = Number(legacyMatch[1]) - 1;

    if (index < 0) return null;

    const docs = await getSortedTransactions(userId, category);

    return docs[index] || null;
  }

  if (mongoose.Types.ObjectId.isValid(transactionId)) {
    return await Transaction.findOne({
      _id: transactionId,
      user: userId,
      category,
    });
  }

  return null;
}

async function getTransactionHistory(usernameOrId) {
  const userId = await resolveUserId(usernameOrId);

  if (!userId) return {};

  const docs = await getSortedTransactions(userId);

  const grouped = {};
  const categoryCounts = {};

  for (const doc of docs) {
    if (!grouped[doc.category]) {
      grouped[doc.category] = {};
      categoryCounts[doc.category] = 0;
    }

    let key = legacyTransactionKey(categoryCounts[doc.category]);
    categoryCounts[doc.category] += 1;

    const deletedLegacyIds = getDeletedLegacyIds(userId, doc.category);

    while (deletedLegacyIds.has(key)) {
      key = legacyTransactionKey(categoryCounts[doc.category]);
      categoryCounts[doc.category] += 1;
    }

    const dateValue =
      doc.date instanceof Date
        ? doc.date.toISOString().slice(0, 10)
        : String(doc.date).slice(0, 10);

    grouped[doc.category][key] = {
      date: dateValue,
      description: doc.description,
      amount: doc.amount,
    };
  }

  return grouped;
}

async function addTransaction(usernameOrId, category, date, description, amount) {
  const userId = await resolveUserId(usernameOrId);

  if (!userId) return false;

  return await Transaction.create({
    user: userId,
    category,
    date,
    description,
    amount,
  });
}

async function updateTransaction(usernameOrId, category, transactionId, date, description, amount) {
  const userId = await resolveUserId(usernameOrId);

  if (!userId) return false;

  const txn = await resolveTransactionDoc(userId, category, transactionId);

  if (!txn) return false;

  txn.date = date;
  txn.description = description;
  txn.amount = amount;

  await txn.save();

  return true;
}

async function deleteTransaction(usernameOrId, category, transactionId) {
  const userId = await resolveUserId(usernameOrId);

  if (!userId) return false;

  const txn = await resolveTransactionDoc(userId, category, transactionId);

  if (!txn) return false;

  const legacyMatch = String(transactionId).match(/^transaction(\d+)$/);

  if (legacyMatch) {
    getDeletedLegacyIds(userId, category).add(String(transactionId));
  }

  await Transaction.deleteOne({
    _id: txn._id,
    user: userId,
    category,
  });

  return true;
}

module.exports = {
  getTransactionHistory,
  addTransaction,
  updateTransaction,
  deleteTransaction,
};