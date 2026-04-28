require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Transaction = require('../models/transaction');

const transactionsByUsername = {
    alexr: [
        { category: 'food',          date: '2026-01-01', description: 'Grocery shopping', amount: 150 },
        { category: 'housing',       date: '2026-01-05', description: 'Rent payment',     amount: 2000 },
        { category: 'health',        date: '2026-01-10', description: 'Doctor visit',     amount: 100 },
        { category: 'entertainment', date: '2026-01-15', description: 'Movie tickets',    amount: 50 },
    ],
    jordy88: [
        { category: 'food',          date: '2026-01-01', description: 'Grocery shopping', amount: 250 },
        { category: 'housing',       date: '2026-01-05', description: 'Rent payment',     amount: 1000 },
        { category: 'health',        date: '2026-01-10', description: 'Doctor visit',     amount: 1000 },
        { category: 'entertainment', date: '2026-01-15', description: 'Movie tickets',    amount: 250 },
    ],
    caseybuilds: [
        { category: 'food',          date: '2026-01-01', description: 'Grocery shopping', amount: 1000 },
        { category: 'housing',       date: '2026-01-05', description: 'Rent payment',     amount: 1500 },
        { category: 'health',        date: '2026-01-10', description: 'Doctor visit',     amount: 250 },
        { category: 'entertainment', date: '2026-01-15', description: 'Movie tickets',    amount: 750 },
    ],
};

async function seedTransactions() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to DB");

        await Transaction.deleteMany();

        for (const [username, transactions] of Object.entries(transactionsByUsername)) {
            const user = await User.findOne({ username });
            if (!user) {
                console.warn(`Skipping ${username}: user not found. Run seedUsers first.`);
                continue;
            }
            const docs = transactions.map((t) => ({ user: user._id, ...t }));
            await Transaction.insertMany(docs);
            console.log(`  + ${docs.length} transactions for ${username}`);
        }

        console.log("Transactions seeded successfully");
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

seedTransactions();
