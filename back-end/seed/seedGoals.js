require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/user');
const Goal = require('../models/budgetGoal');

const goalsByUsername = {
    alexr: {
        total:         { goal: 10000, current: 5000, startDate: '2026-01-01', endDate: '2026-12-31' },
        food:          { goal: 2000, current: 1000 },
        housing:       { goal: 4000, current: 2000 },
        health:        { goal: 3000, current: 1500 },
        entertainment: { goal: 1000, current: 500 },
    },
    jordy88: {
        total:         { goal: 5000, current: 2500, startDate: '2026-01-02', endDate: '2026-03-31' },
        food:          { goal: 1000, current: 500 },
        housing:       { goal: 2000, current: 1000 },
        health:        { goal: 1000, current: 500 },
        entertainment: { goal: 1000, current: 500 },
    },
    caseybuilds: {
        total:         { goal: 7000, current: 3500, startDate: '2026-01-03', endDate: '2026-02-28' },
        food:          { goal: 2000, current: 1000 },
        housing:       { goal: 3000, current: 1500 },
        health:        { goal: 500, current: 250 },
        entertainment: { goal: 1500, current: 750 },
    },
};

async function seedGoals() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to DB");

        await Goal.deleteMany();

        for (const [username, goals] of Object.entries(goalsByUsername)) {
            const user = await User.findOne({ username });
            if (!user) {
                console.warn(`Skipping ${username}: user not found. Run seedUsers first.`);
                continue;
            }
            await Goal.create({ user: user._id, ...goals });
            console.log(`  + goal for ${username}`);
        }

        console.log("Goals seeded successfully");
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

seedGoals();
