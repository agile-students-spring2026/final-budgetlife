const { expect } = require("chai");
const {
  connectTestDB,
  clearTestDB,
  closeTestDB,
} = require("./setupMongoMemory");
const {
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
} = require("../data/budgetGoalsStore");
const { getUserCurrency } = require("../data/shop");

describe("budgetGoalsStore", () => {
  before(async () => {
    await connectTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();
    await resetBudgetGoals();
  });

  after(async () => {
    await closeTestDB();
  });

  describe("getBudgetGoals", () => {
    it("returns the goals object for a seeded user", async () => {
      const goals = await getBudgetGoals("alexr");
      expect(goals).to.be.an("object");
      expect(goals).to.have.property("total");
      expect(goals).to.have.property("food");
      expect(goals).to.have.property("housing");
      expect(goals).to.have.property("health");
      expect(goals).to.have.property("entertainment");
      expect(goals.total.goal).to.equal(10000);
    });

    it("returns null for an unknown user", async () => {
      expect(await getBudgetGoals("nobody_xyz")).to.equal(null);
    });
  });

  describe("updateBudgetGoals", () => {
    it("updates the goal of an existing category and returns true", async () => {
      const ok = await updateBudgetGoals("alexr", "food", 2500);
      expect(ok).to.equal(true);

      const goals = await getBudgetGoals("alexr");
      expect(goals.food.goal).to.equal(2500);
    });

    it("returns false for an unknown user", async () => {
      expect(await updateBudgetGoals("nobody_xyz", "food", 100)).to.equal(false);
    });

    it("returns false for an unknown category", async () => {
      expect(await updateBudgetGoals("alexr", "vacations", 100)).to.equal(false);
    });
  });

  describe("updateCurrentAmount", () => {
    it("updates the current amount of a category", async () => {
      const ok = await updateCurrentAmount("alexr", "housing", 1234);
      expect(ok).to.equal(true);

      const goals = await getBudgetGoals("alexr");
      expect(goals.housing.current).to.equal(1234);
    });

    it("returns false for an unknown user", async () => {
      expect(await updateCurrentAmount("nobody_xyz", "housing", 1)).to.equal(false);
    });

    it("returns false for an unknown category", async () => {
      expect(await updateCurrentAmount("alexr", "vacations", 1)).to.equal(false);
    });
  });

  describe("addUserBudgetGoals / deleteUserBudgetGoals", () => {
    it("adds a brand-new user with zeroed goals", async () => {
      const added = await addUserBudgetGoals("_brand_new_user_");
      expect(added).to.equal(true);

      const goals = await getBudgetGoals("_brand_new_user_");
      expect(goals).to.be.an("object");
      expect(goals.total.goal).to.equal(0);
      expect(goals.food.current).to.equal(0);
    });

    it("returns false when adding a user that already exists", async () => {
      await addUserBudgetGoals("_brand_new_user_");
      const second = await addUserBudgetGoals("_brand_new_user_");
      expect(second).to.equal(false);
    });

    it("deletes an existing user", async () => {
      await addUserBudgetGoals("_to_be_deleted_");
      expect(await getBudgetGoals("_to_be_deleted_")).to.not.equal(null);

      const deleted = await deleteUserBudgetGoals("_to_be_deleted_");
      expect(deleted).to.equal(true);
      expect(await getBudgetGoals("_to_be_deleted_")).to.equal(null);
    });

    it("returns false when deleting a non-existent user", async () => {
      expect(await deleteUserBudgetGoals("nobody_xyz")).to.equal(false);
    });
  });

  describe("updateBudgetGoalDates", () => {
    it("sets startDate and endDate on the total goal", async () => {
      const ok = await updateBudgetGoalDates("alexr", "2027-01-01", "2027-12-31");
      expect(ok).to.equal(true);

      const goals = await getBudgetGoals("alexr");
      expect(goals.total.startDate).to.equal("2027-01-01");
      expect(goals.total.endDate).to.equal("2027-12-31");
    });

    it("returns false for an unknown user", async () => {
      expect(
        await updateBudgetGoalDates("nobody_xyz", "2027-01-01", "2027-12-31")
      ).to.equal(false);
    });
  });

  describe("calculateCurrentAmount", () => {
    it("recomputes per-category and total currents from transactions", async () => {
      await calculateCurrentAmount("alexr");
      const goals = await getBudgetGoals("alexr");

      expect(goals.food.current).to.equal(150);
      expect(goals.housing.current).to.equal(2000);
      expect(goals.health.current).to.equal(100);
      expect(goals.entertainment.current).to.equal(50);
      expect(goals.total.current).to.equal(2300);
    });

    it("yields zero currents for a user with no transactions", async () => {
      await calculateCurrentAmount("taylortracks");
      const goals = await getBudgetGoals("taylortracks");

      expect(goals.food.current).to.equal(0);
      expect(goals.total.current).to.equal(0);
    });

    it("does nothing for an unknown user (no throw)", async () => {
      let err = null;
      try {
        await calculateCurrentAmount("nobody_xyz");
      } catch (e) {
        err = e;
      }
      expect(err).to.equal(null);
    });
  });

  describe("getBuildingHealth", () => {
    it("returns a health percentage object keyed by building", async () => {
      const health = await getBuildingHealth("alexr");
      expect(health).to.be.an("object");
      expect(health).to.have.all.keys(
        "cityhall",
        "houses",
        "restaurant",
        "hospital",
        "cinema"
      );

      for (const v of Object.values(health)) {
        expect(v).to.be.a("number");
        expect(v).to.be.at.least(0);
        expect(v).to.be.at.most(100);
      }
    });

    it("returns null for an unknown user", async () => {
      expect(await getBuildingHealth("nobody_xyz")).to.equal(null);
    });

    it("computes housing health correctly for alexr", async () => {
      const health = await getBuildingHealth("alexr");
      expect(health.houses).to.equal(50);
    });
  });

  describe("rewardUser", () => {
    it("returns a structured payload when the goal period is still in the future", async () => {
      const result = await rewardUser("alexr");
      expect(result).to.be.an("object");
      expect(result).to.have.property("message");
      expect(result).to.have.property("rewarded");
      expect(result).to.have.property("currencyAwarded");
      expect(result).to.have.property("xpAwarded");
      expect(result).to.have.property("streakCount");
      expect(result).to.have.property("streakBonusXpPerBuilding");
      expect(result).to.have.property("details");
    });

    it("returns a structured reward payload for a user whose end date has passed", async () => {
      const before = await getUserCurrency("taylortracks");
      const result = await rewardUser("taylortracks");
      const after = await getUserCurrency("taylortracks");

      expect(result).to.be.an("object");
      expect(result).to.have.property("message");
      expect(result).to.have.property("rewarded");
      expect(result).to.have.property("currencyAwarded");
      expect(result).to.have.property("xpAwarded");
      expect(result).to.have.property("details");
      expect(after).to.be.at.least(before);
    });

    it("returns a structured not-found payload for an unknown user", async () => {
      const result = await rewardUser("nobody_xyz");
      expect(result).to.be.an("object");
      expect(result.rewarded).to.equal(false);
      expect(result.message).to.match(/user not found/i);
    });
  });

  describe("resetBudgetGoals", () => {
    it("restores the goals copy to the seed values", async () => {
      await updateBudgetGoals("alexr", "food", 9999);

      let goals = await getBudgetGoals("alexr");
      expect(goals.food.goal).to.equal(9999);

      await resetBudgetGoals();

      goals = await getBudgetGoals("alexr");
      expect(goals.food.goal).to.equal(2000);
    });
  });
});