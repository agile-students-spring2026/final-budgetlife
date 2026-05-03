const mongoose = require("mongoose");
const { addUserCurrency } = require("./shop");
const { getTransactionHistory } = require("./transaction");
const cityStates = require("./cityStates");
const Goal = require("../models/budgetGoal");
const User = require("../models/user");

const EMPTY_GOAL_TEMPLATE = {
  total: { goal: 0, current: 0, startDate: null, endDate: null },
  food: { goal: 0, current: 0 },
  housing: { goal: 0, current: 0 },
  health: { goal: 0, current: 0 },
  entertainment: { goal: 0, current: 0 },
};

function getDefaultGoalsForUsername(username) {
  const baseGoals = {
    alexr: {
      total: {
        goal: 10000,
        current: 0,
        startDate: "2026-04-01",
        endDate: "2026-04-30",
      },
      food: {
        goal: 2000,
        current: 0,
      },
      housing: {
        goal: 4000,
        current: 0,
      },
      health: {
        goal: 2000,
        current: 0,
      },
      entertainment: {
        goal: 2000,
        current: 0,
      },
    },
    taylortracks: {
      total: {
        goal: 10000,
        current: 0,
        startDate: "2026-01-01",
        endDate: "2026-01-31",
      },
      food: {
        goal: 2000,
        current: 0,
      },
      housing: {
        goal: 4000,
        current: 0,
      },
      health: {
        goal: 2000,
        current: 0,
      },
      entertainment: {
        goal: 2000,
        current: 0,
      },
    },
  };

  return baseGoals[username] || null;
}

function normalizeGoalCategory(category) {
  const normalized = String(category || "").trim().toLowerCase();

  if (
    normalized === "cityhall" ||
    normalized === "city hall" ||
    normalized === "city_hall" ||
    normalized === "city-hall" ||
    normalized === "total" ||
    normalized === "overall"
  ) {
    return "total";
  }

  return category;
}

async function resolveUserId(usernameOrId, createIfMissing = false) {
  if (!usernameOrId) return null;

  if (mongoose.Types.ObjectId.isValid(usernameOrId)) {
    return usernameOrId;
  }

  const username = String(usernameOrId).trim().toLowerCase();

  let user = await User.findOne({ username }).select("_id").lean();

  if (!user && createIfMissing) {
    const created = await User.create({
      username,
      email: `${username}@example.com`,
      password: "password123",
      playerState: {
        money: 1000,
        inventory: [],
        equippedItems: {
          collar: null,
          eyewear: null,
          hat: null,
          earring: null,
        },
      },
    });

    user = created;
  }

  return user ? user._id : null;
}

async function ensureBudgetGoals(usernameOrId) {
  const userId = await resolveUserId(usernameOrId);

  if (!userId) return null;

  const existingGoal = await Goal.findOne({ user: userId });

  if (existingGoal) return existingGoal;

  let username = null;

  if (!mongoose.Types.ObjectId.isValid(usernameOrId)) {
    username = String(usernameOrId).trim().toLowerCase();
  } else {
    const user = await User.findById(userId).select("username").lean();
    username = user?.username || null;
  }

  const defaultGoals = getDefaultGoalsForUsername(username);

  if (!defaultGoals) return null;

  try {
    return await Goal.findOneAndUpdate(
      { user: userId },
      {
        $setOnInsert: {
          user: userId,
          total: { ...defaultGoals.total },
          food: { ...defaultGoals.food },
          housing: { ...defaultGoals.housing },
          health: { ...defaultGoals.health },
          entertainment: { ...defaultGoals.entertainment },
        },
      },
      {
        returnDocument: "after",
        upsert: true,
      }
    );
  } catch (err) {
    if (err && err.code === 11000) {
      return await Goal.findOne({ user: userId });
    }

    throw err;
  }
}

async function getBudgetGoals(usernameOrId) {
  return await ensureBudgetGoals(usernameOrId);
}

async function updateBudgetGoals(usernameOrId, category, newGoal) {
  const goal = await ensureBudgetGoals(usernameOrId);

  if (!goal) return false;

  const normalizedCategory = normalizeGoalCategory(category);

  if (!goal[normalizedCategory]) return false;

  goal[normalizedCategory].goal = newGoal;

  await goal.save();

  return true;
}

async function updateCurrentAmount(usernameOrId, category, newCurrent) {
  const goal = await ensureBudgetGoals(usernameOrId);

  if (!goal) return false;

  if (!goal[category]) return false;

  goal[category].current = newCurrent;

  await goal.save();

  return true;
}

async function resetBudgetGoals() {
  await Goal.deleteMany({});

  await ensureBudgetGoals("alexr");
  await ensureBudgetGoals("taylortracks");
}

async function addUserBudgetGoals(usernameOrId) {
  const userId = await resolveUserId(usernameOrId, true);

  if (!userId) return false;

  const existing = await Goal.findOne({ user: userId });

  if (existing) return false;

  await Goal.create({
    user: userId,
    total: { ...EMPTY_GOAL_TEMPLATE.total },
    food: { ...EMPTY_GOAL_TEMPLATE.food },
    housing: { ...EMPTY_GOAL_TEMPLATE.housing },
    health: { ...EMPTY_GOAL_TEMPLATE.health },
    entertainment: { ...EMPTY_GOAL_TEMPLATE.entertainment },
  });

  return true;
}

async function deleteUserBudgetGoals(usernameOrId) {
  const userId = await resolveUserId(usernameOrId);

  if (!userId) return false;

  const result = await Goal.findOneAndDelete({ user: userId });

  return result !== null;
}

async function updateBudgetGoalDates(usernameOrId, startDate, endDate) {
  const goal = await ensureBudgetGoals(usernameOrId);

  if (!goal || !goal.total) return false;

  goal.total.startDate = startDate;
  goal.total.endDate = endDate;

  await goal.save();

  return true;
}

async function recalcGoalCurrents(goal, usernameOrId) {
  if (!goal) return null;

  const transactions = await getTransactionHistory(usernameOrId);

  for (const cat of ["food", "housing", "health", "entertainment"]) {
    if (goal[cat]) {
      goal[cat].current = 0;
    }
  }

  let totalCurrent = 0;

  for (const category in transactions) {
    let categoryCurrent = 0;

    for (const transactionId in transactions[category]) {
      const amt = Number(transactions[category][transactionId].amount || 0);
      categoryCurrent += amt;
      totalCurrent += amt;
    }

    if (goal[category]) {
      goal[category].current = categoryCurrent;
    }
  }

  if (goal.total) {
    goal.total.current = totalCurrent;
  }

  await goal.save();

  return goal;
}

async function calculateCurrentAmount(usernameOrId) {
  const goal = await ensureBudgetGoals(usernameOrId);

  if (!goal) return;

  await recalcGoalCurrents(goal, usernameOrId);
}

const CATEGORY_TO_BUILDING = {
  total: "cityhall",
  housing: "houses",
  food: "restaurant",
  health: "hospital",
  entertainment: "cinema",
};

const BUILDING_KEYWORDS = {
  cityhall: ["city hall", "cityhall"],
  houses: ["housing", "houses", "house"],
  restaurant: ["restaurant", "food market", "food"],
  hospital: ["hospital", "health"],
  cinema: ["cinema", "movie", "entertainment"],
};

const DAY_IN_MS = 24 * 60 * 60 * 1000;

function parseDateValue(dateString) {
  if (!dateString) return null;

  const parsed = new Date(`${dateString}T00:00:00Z`);

  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function getIntervalLengthInDays(startDate, endDate) {
  const start = parseDateValue(startDate);
  const end = parseDateValue(endDate);

  if (!start || !end || end < start) {
    return 0;
  }

  return Math.floor((end - start) / DAY_IN_MS) + 1;
}

function getIntervalXpReward(startDate, endDate) {
  const intervalDays = Math.max(1, getIntervalLengthInDays(startDate, endDate));
  const rewardSteps = Math.max(1, Math.ceil(intervalDays / 7));

  return Math.min(500, rewardSteps * 25);
}

function isConsecutiveRewardInterval(previousEndDate, nextStartDate) {
  const previousEnd = parseDateValue(previousEndDate);
  const nextStart = parseDateValue(nextStartDate);

  if (!previousEnd || !nextStart) {
    return false;
  }

  return nextStart.getTime() - previousEnd.getTime() === DAY_IN_MS;
}

function getStreakBonusXp(streakCount, intervalDays) {
  const extraStreaks = Math.max(0, streakCount - 1);

  if (extraStreaks === 0) {
    return 0;
  }

  const normalizedDays = Math.max(1, intervalDays);
  const intervalWeight = Math.max(1, Math.ceil(normalizedDays / 7));
  const streakStepXp = 5 * intervalWeight * intervalWeight;

  return extraStreaks * streakStepXp;
}

function getOverspendPenaltyXp(goalAmount, currentAmount, intervalDays, baseXpAward) {
  const safeGoal = Math.max(1, Number(goalAmount || 0));
  const overspendAmount = Math.max(0, Number(currentAmount || 0) - safeGoal);

  if (overspendAmount <= 0) {
    return 0;
  }

  const intervalWeight = Math.max(1, Math.ceil(Math.max(1, intervalDays) / 7));
  const ratioPenalty = Math.ceil((overspendAmount / safeGoal) * Math.max(25, baseXpAward));
  const minimumPenalty = 10 * intervalWeight;
  const maximumPenalty = Math.max(60, baseXpAward * 3);

  return Math.min(maximumPenalty, Math.max(minimumPenalty, ratioPenalty));
}

function getPreviousExpToNextLevel(expToNextLevel) {
  return Math.max(100, Math.round(Math.max(100, Number(expToNextLevel || 100)) / 1.5));
}

function findBuildingByHealthCategory(city, healthCategory) {
  if (!city || !Array.isArray(city.buildings)) return null;

  const keywords = BUILDING_KEYWORDS[healthCategory] || [];

  return (
    city.buildings.find((building) => {
      if (healthCategory === "cityhall") {
        return building.type === "primary";
      }

      const category = (building.category || "").toLowerCase();
      const name = (building.name || "").toLowerCase();

      return keywords.some((keyword) => {
        return name.includes(keyword) || category.includes(keyword);
      });
    }) || null
  );
}

function applyXpDelta(building, xpDelta) {
  if (!building || xpDelta === 0) {
    return {
      levelsGained: 0,
      levelsLost: 0,
      currentExp: building?.currentExp || 0,
      expToNextLevel: building?.expToNextLevel || 0,
    };
  }

  let currentExp = Number(building.currentExp || 0);
  let expToNextLevel = Math.max(100, Number(building.expToNextLevel || 100));
  let level = Math.max(1, Number(building.level || 1));
  let levelsGained = 0;
  let levelsLost = 0;

  if (xpDelta > 0) {
    let remainingXp = xpDelta;

    while (remainingXp > 0) {
      const neededXp = Math.max(1, expToNextLevel - currentExp);

      if (remainingXp < neededXp) {
        currentExp += remainingXp;
        remainingXp = 0;
        break;
      }

      remainingXp -= neededXp;
      level += 1;
      levelsGained += 1;
      currentExp = 0;
      expToNextLevel = Math.max(100, Math.round(expToNextLevel * 1.5));
    }
  } else {
    let remainingPenalty = Math.abs(xpDelta);

    while (remainingPenalty > 0) {
      if (currentExp > 0) {
        const deducted = Math.min(currentExp, remainingPenalty);
        currentExp -= deducted;
        remainingPenalty -= deducted;

        if (remainingPenalty === 0) {
          break;
        }
      }

      if (level <= 1) {
        currentExp = 0;
        break;
      }

      level -= 1;
      levelsLost += 1;
      expToNextLevel = getPreviousExpToNextLevel(expToNextLevel);
      currentExp = expToNextLevel;
    }
  }

  building.level = level;
  building.currentExp = currentExp;
  building.expToNextLevel = expToNextLevel;

  return {
    levelsGained,
    levelsLost,
    currentExp,
    expToNextLevel,
  };
}

function rewardEligibleBuildings(goals, username) {
  const city = cityStates[username];

  if (!goals || !goals.total || !city) {
    return {
      rewarded: false,
      xpAwarded: 0,
      intervalDays: 0,
      details: [],
      reason: "missing-data",
    };
  }

  const startDate = goals.total.startDate;
  const endDate = goals.total.endDate;
  const intervalEnd = parseDateValue(endDate);

  if (!intervalEnd) {
    return {
      rewarded: false,
      xpAwarded: 0,
      intervalDays: 0,
      details: [],
      reason: "missing-interval",
    };
  }

  const now = new Date();

  if (now < intervalEnd) {
    return {
      rewarded: false,
      xpAwarded: 0,
      intervalDays: getIntervalLengthInDays(startDate, endDate),
      details: [],
      reason: "interval-not-ended",
    };
  }

  const intervalKey = `${startDate || ""}:${endDate}`;

  city.budgetRewardStatus = city.budgetRewardStatus || {
    claimedIntervals: {},
    currentStreak: 0,
    lastRewardedIntervalEndDate: null,
  };

  city.budgetRewardStatus.claimedIntervals =
    city.budgetRewardStatus.claimedIntervals || {};

  city.budgetRewardStatus.currentStreak = Number(
    city.budgetRewardStatus.currentStreak || 0
  );

  city.budgetRewardStatus.lastRewardedIntervalEndDate =
    city.budgetRewardStatus.lastRewardedIntervalEndDate || null;

  if (city.budgetRewardStatus.claimedIntervals[intervalKey]) {
    return {
      rewarded: false,
      xpAwarded: 0,
      intervalDays: getIntervalLengthInDays(startDate, endDate),
      streakCount: city.budgetRewardStatus.currentStreak,
      streakBonusXpPerBuilding: 0,
      details: [],
      reason: "already-claimed",
    };
  }

  const intervalDays = getIntervalLengthInDays(startDate, endDate);
  const underTotalBudget = goals.total.current <= goals.total.goal;

  const streakCount =
    underTotalBudget &&
    isConsecutiveRewardInterval(
      city.budgetRewardStatus.lastRewardedIntervalEndDate,
      startDate
    )
      ? city.budgetRewardStatus.currentStreak + 1
      : underTotalBudget
        ? 1
        : 0;

  const baseXpAward = getIntervalXpReward(startDate, endDate);
  const streakBonusXp = getStreakBonusXp(streakCount, intervalDays);
  const xpAward = baseXpAward + streakBonusXp;
  const details = [];
  let totalXpAwarded = 0;

  for (const [category, healthCategory] of Object.entries(CATEGORY_TO_BUILDING)) {
    const entry = goals[category];

    if (!entry || typeof entry.goal !== "number" || entry.goal <= 0) {
      continue;
    }

    if (typeof entry.current !== "number") {
      continue;
    }

    const building = findBuildingByHealthCategory(city, healthCategory);

    if (!building) {
      continue;
    }

    const beforeLevel = Number(building.level || 1);
    const overspendAmount = Math.max(0, entry.current - entry.goal);

    const xpDelta =
      overspendAmount > 0
        ? -getOverspendPenaltyXp(entry.goal, entry.current, intervalDays, baseXpAward)
        : xpAward;

    const xpResult = applyXpDelta(building, xpDelta);

    totalXpAwarded += xpDelta;

    details.push({
      buildingId: building.i,
      buildingName: building.name,
      category,
      baseXpAwarded: overspendAmount > 0 ? 0 : baseXpAward,
      streakBonusXpAwarded: overspendAmount > 0 ? 0 : streakBonusXp,
      overspendAmount,
      xpAwarded: xpDelta,
      levelBefore: beforeLevel,
      levelAfter: building.level,
      levelsGained: xpResult.levelsGained,
      levelsLost: xpResult.levelsLost,
      currentExp: xpResult.currentExp,
      expToNextLevel: xpResult.expToNextLevel,
    });
  }

  if (details.length === 0) {
    return {
      rewarded: false,
      xpAwarded: 0,
      intervalDays,
      streakCount,
      streakBonusXpPerBuilding: streakBonusXp,
      details: [],
      reason: "no-buildings-qualified",
    };
  }

  city.budgetRewardStatus.claimedIntervals[intervalKey] = {
    claimedAt: new Date().toISOString(),
    streakCount,
    xpAwarded: totalXpAwarded,
    rewardedBuildings: details.map((detail) => detail.buildingId),
  };

  city.budgetRewardStatus.currentStreak = streakCount;
  city.budgetRewardStatus.lastRewardedIntervalEndDate = endDate;

  return {
    rewarded: true,
    xpAwarded: totalXpAwarded,
    intervalDays,
    streakCount,
    streakBonusXpPerBuilding: streakBonusXp,
    details,
    reason: null,
  };
}

async function getBuildingHealth(usernameOrId) {
  const goal = await ensureBudgetGoals(usernameOrId);

  if (!goal) return null;

  await recalcGoalCurrents(goal, usernameOrId);

  const result = {};

  for (const [category, building] of Object.entries(CATEGORY_TO_BUILDING)) {
    const entry = goal[category];

    if (!entry || !entry.goal) {
      result[building] = 100;
      continue;
    }

    const remaining = entry.goal - entry.current;
    const pct = Math.round((remaining / entry.goal) * 100);

    result[building] = Math.max(0, Math.min(100, pct));
  }

  return result;
}

async function rewardUser(usernameOrId) {
  const userId = await resolveUserId(usernameOrId);

  if (!userId) {
    return {
      rewarded: false,
      currencyAwarded: 0,
      xpAwarded: 0,
      intervalDays: 0,
      streakCount: 0,
      streakBonusXpPerBuilding: 0,
      details: [],
      message: "User not found.",
    };
  }

  const userDoc = await User.findById(userId).select("username").lean();
  const goal = await ensureBudgetGoals(userId);

  if (!userDoc || !goal || !goal.total) {
    return {
      rewarded: false,
      currencyAwarded: 0,
      xpAwarded: 0,
      intervalDays: 0,
      streakCount: 0,
      streakBonusXpPerBuilding: 0,
      details: [],
      message: "User not found.",
    };
  }

  await recalcGoalCurrents(goal, userId);

  const totalGoal = goal.total.goal;
  const totalCurrent = goal.total.current;
  const rewardResult = rewardEligibleBuildings(goal, userDoc.username);
  const goalEndDate = parseDateValue(goal.total.endDate);
  const intervalEnded = goalEndDate && new Date() >= goalEndDate;

  if (totalCurrent <= totalGoal && intervalEnded) {
    const added = totalGoal - totalCurrent;

    if (rewardResult.reason !== "already-claimed") {
      await addUserCurrency(userId, added);
    }

    const gainedCount = rewardResult.details.filter((detail) => detail.xpAwarded > 0).length;
    const lostCount = rewardResult.details.filter((detail) => detail.xpAwarded < 0).length;

    const detailsSuffix = rewardResult.rewarded
      ? `${gainedCount > 0 ? ` ${gainedCount} building${gainedCount === 1 ? "" : "s"} gained XP.` : ""}${lostCount > 0 ? ` ${lostCount} building${lostCount === 1 ? "" : "s"} lost XP from overspending.` : ""}`
      : "";

    return {
      rewarded: rewardResult.rewarded,
      currencyAwarded: rewardResult.reason === "already-claimed" ? 0 : added,
      xpAwarded: rewardResult.xpAwarded,
      intervalDays: rewardResult.intervalDays,
      streakCount: rewardResult.streakCount || 0,
      streakBonusXpPerBuilding: rewardResult.streakBonusXpPerBuilding || 0,
      details: rewardResult.details,
      message:
        rewardResult.reason === "already-claimed"
          ? "Budget reward already claimed for this interval."
          : `Congratulations! You've met your budget goal!${detailsSuffix}${rewardResult.streakCount > 1 ? ` Streak ${rewardResult.streakCount} adds ${rewardResult.streakBonusXpPerBuilding} bonus XP per building.` : ""}`,
    };
  }

  if (intervalEnded && rewardResult.details.length > 0) {
    const lostCount = rewardResult.details.filter((detail) => detail.xpAwarded < 0).length;

    return {
      rewarded: true,
      currencyAwarded: 0,
      xpAwarded: rewardResult.xpAwarded,
      intervalDays: rewardResult.intervalDays,
      streakCount: rewardResult.streakCount || 0,
      streakBonusXpPerBuilding: rewardResult.streakBonusXpPerBuilding || 0,
      details: rewardResult.details,
      message:
        lostCount > 0
          ? `${lostCount} building${lostCount === 1 ? "" : "s"} lost XP for overspending this interval.`
          : "Budget interval processed.",
    };
  }

  return {
    rewarded: false,
    currencyAwarded: 0,
    xpAwarded: 0,
    intervalDays: rewardResult.intervalDays,
    streakCount: rewardResult.streakCount || 0,
    streakBonusXpPerBuilding: rewardResult.streakBonusXpPerBuilding || 0,
    details: [],
    message: "Keep going! You're doing great!",
  };
}

module.exports = {
  getBudgetGoals,
  updateBudgetGoals,
  updateCurrentAmount,
  resetBudgetGoals,
  addUserBudgetGoals,
  deleteUserBudgetGoals,
  updateBudgetGoalDates,
  calculateCurrentAmount,
  rewardUser,
  getBuildingHealth,
};