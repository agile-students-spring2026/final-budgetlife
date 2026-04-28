require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const UserCurrency = require('../models/userCurrency');

const currencyByUsername = {
    alexr:       0,
    jordy88:     0,
    caseybuilds: 0,
};

async function seedShop() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to DB");

        await UserCurrency.deleteMany();

        for (const [username, currency] of Object.entries(currencyByUsername)) {
            const user = await User.findOne({ username });
            if (!user) {
                console.warn(`Skipping ${username}: user not found. Run seedUsers first.`);
                continue;
            }
            await UserCurrency.create({ user: user._id, currency });
            console.log(`  + currency for ${username}: ${currency}`);
        }

        console.log("Shop (userCurrency) seeded successfully");
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

seedShop();
