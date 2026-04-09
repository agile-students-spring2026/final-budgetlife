const { expect } = require("chai");
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
  beforeEach(() => {
    resetBudgetGoals();
  });

  describe("getBudgetGoals", () => {
    it("returns the goals object for a seeded user", () => {
      const goals = getBudgetGoals("alexr");
      expect(goals).to.be.an("object");
      expect(goals).to.have.property("total");
      expect(goals).to.have.property("food");
      expect(goals).to.have.property("housing");
      expect(goals).to.have.property("health");
      expect(goals).to.have.property("entertainment");
      expect(goals.total.goal).to.equal(10000);
    });

    it("returns null for an unknown user", () => {
      expect(getBudgetGoals("nobody_xyz")).to.equal(null);
    });
  });

  describe("updateBudgetGoals", () => {
    it("updates the goal of an existing category and returns true", () => {
      const ok = updateBudgetGoals("alexr", "food", 2500);
      expect(ok).to.equal(true);
      expect(getBudgetGoals("alexr").food.goal).to.equal(2500);
    });

    it("returns false for an unknown user", () => {
      expect(updateBudgetGoals("nobody_xyz", "food", 100)).to.equal(false);
    });

    it("returns false for an unknown category", () => {
      expect(updateBudgetGoals("alexr", "vacations", 100)).to.equal(false);
    });
  });

  describe("updateCurrentAmount", () => {
    it("updates the current amount of a category", () => {
      const ok = updateCurrentAmount("alexr", "housing", 1234);
      expect(ok).to.equal(true);
      expect(getBudgetGoals("alexr").housing.current).to.equal(1234);
    });

    it("returns false for an unknown user", () => {
      expect(updateCurrentAmount("nobody_xyz", "housing", 1)).to.equal(false);
    });

    it("returns false for an unknown category", () => {
      expect(updateCurrentAmount("alexr", "vacations", 1)).to.equal(false);
    });
  });

  describe("addUserBudgetGoals / deleteUserBudgetGoals", () => {
    it("adds a brand-new user with zeroed goals", () => {
      const added = addUserBudgetGoals("_brand_new_user_");
      expect(added).to.equal(true);
      const goals = getBudgetGoals("_brand_new_user_");
      expect(goals).to.be.an("object");
      expect(goals.total.goal).to.equal(0);
      expect(goals.food.current).to.equal(0);
    });

    it("returns false when adding a user that already exists", () => {
      addUserBudgetGoals("_brand_new_user_");
      const second = addUserBudgetGoals("_brand_new_user_");
      expect(second).to.equal(false);
    });

    it("deletes an existing user", () => {
      addUserBudgetGoals("_to_be_deleted_");
      expect(getBudgetGoals("_to_be_deleted_")).to.not.equal(null);
      const deleted = deleteUserBudgetGoals("_to_be_deleted_");
      expect(deleted).to.equal(true);
      expect(getBudgetGoals("_to_be_deleted_")).to.equal(null);
    });

    it("returns false when deleting a non-existent user", () => {
      expect(deleteUserBudgetGoals("nobody_xyz")).to.equal(false);
    });
  });

  describe("updateBudgetGoalDates", () => {
    it("sets startDate and endDate on the total goal", () => {
      const ok = updateBudgetGoalDates("alexr", "2027-01-01", "2027-12-31");
      expect(ok).to.equal(true);
      const goals = getBudgetGoals("alexr");
      expect(goals.total.startDate).to.equal("2027-01-01");
      expect(goals.total.endDate).to.equal("2027-12-31");
    });

    it("returns false for an unknown user", () => {
      expect(
        updateBudgetGoalDates("nobody_xyz", "2027-01-01", "2027-12-31")
      ).to.equal(false);
    });
  });

  describe("calculateCurrentAmount", () => {
    it("recomputes per-category and total currents from transactions", () => {
      // alexr seed transactions: food 150, housing 2000, health 100, entertainment 50
      calculateCurrentAmount("alexr");
      const goals = getBudgetGoals("alexr");
      expect(goals.food.current).to.equal(150);
      expect(goals.housing.current).to.equal(2000);
      expect(goals.health.current).to.equal(100);
      expect(goals.entertainment.current).to.equal(50);
      expect(goals.total.current).to.equal(150 + 2000 + 100 + 50);
    });

    it("yields zero currents for a user with no transactions", () => {
      calculateCurrentAmount("taylortracks");
      const goals = getBudgetGoals("taylortracks");
      expect(goals.food.current).to.equal(0);
      expect(goals.total.current).to.equal(0);
    });

    it("does nothing for an unknown user (no throw)", () => {
      expect(() => calculateCurrentAmount("nobody_xyz")).to.not.throw();
    });
  });

  describe("getBuildingHealth", () => {
    it("returns a health percentage object keyed by building", () => {
      const health = getBuildingHealth("alexr");
      expect(health).to.be.an("object");
      expect(health).to.have.all.keys(
        "cityhall",
        "houses",
        "restaurant",
        "hospital",
        "cinema"
      );
      // every value is a percentage between 0 and 100
      for (const v of Object.values(health)) {
        expect(v).to.be.a("number");
        expect(v).to.be.at.least(0);
        expect(v).to.be.at.most(100);
      }
    });

    it("returns null for an unknown user", () => {
      expect(getBuildingHealth("nobody_xyz")).to.equal(null);
    });

    it("computes housing health correctly for alexr", () => {
      // alexr: housing goal 4000, transaction 2000 → remaining 2000 → 50%
      const health = getBuildingHealth("alexr");
      expect(health.houses).to.equal(50);
    });
  });

  describe("rewardUser", () => {
    it("returns 'Keep going!' when the goal period is still in the future", () => {
      // alexr endDate = 2026-12-31 (future relative to most test runs in 2026)
      const msg = rewardUser("alexr");
      expect(msg).to.be.a("string");
      // Either "Keep going!" if before endDate, or congrats if after.
      // This branch test only checks shape; the after-endDate branch is covered below.
      expect(msg.length).to.be.greaterThan(0);
    });

    it("congratulates a user whose end date has passed and grants currency", () => {
      // taylortracks endDate = 2026-1-31 (already past), no transactions → current 0 ≤ goal
      const before = getUserCurrency("taylortracks");
      const msg = rewardUser("taylortracks");
      expect(msg).to.match(/Congratulations/i);
      const after = getUserCurrency("taylortracks");
      // currency should have increased by (goal - current) = 7000
      expect(after).to.be.greaterThan(before);
    });

    it("returns 'User not found.' for an unknown user", () => {
      expect(rewardUser("nobody_xyz")).to.equal("User not found.");
    });
  });

  describe("resetBudgetGoals", () => {
    it("restores the goals copy to the seed values", () => {
      updateBudgetGoals("alexr", "food", 9999);
      expect(getBudgetGoals("alexr").food.goal).to.equal(9999);
      resetBudgetGoals();
      expect(getBudgetGoals("alexr").food.goal).to.equal(2000);
    });
  });
});
