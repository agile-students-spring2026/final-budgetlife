const User = require("../models/User");

async function getUserCurrency(userId) {
    const user = await User.findById(userId).select("playerState.money").lean();
    return user?.playerState?.money ?? null;
}

async function addUserCurrency(userId, amount) {
    await User.findByIdAndUpdate(
        userId,
        { $inc: { "playerState.money": amount } }
    );
}

module.exports = { addUserCurrency, getUserCurrency };
