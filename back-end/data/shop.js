const mongoose = require("mongoose");
const User = require("../models/user");

async function resolveUser(usernameOrId) {
  if (!usernameOrId) return null;

  if (mongoose.Types.ObjectId.isValid(usernameOrId)) {
    return await User.findById(usernameOrId);
  }

  return await User.findOne({
    username: String(usernameOrId).trim().toLowerCase(),
  });
}

async function getUserCurrency(usernameOrId) {
  const user = await resolveUser(usernameOrId);

  return user?.playerState?.money ?? null;
}

async function addUserCurrency(usernameOrId, amount) {
  const user = await resolveUser(usernameOrId);

  if (!user) return false;

  user.playerState = user.playerState || {};
  user.playerState.money = Number(user.playerState.money || 0) + Number(amount || 0);

  await user.save();

  return true;
}

module.exports = {
  addUserCurrency,
  getUserCurrency,
};