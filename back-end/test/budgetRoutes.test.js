const { expect } = require("chai");
const request = require("supertest");
const app = require("../app");
const {
  addUserBudgetGoals,
  resetBudgetGoals,
  updateBudgetGoalDates,
} = require("../data/budgetGoalsStore");
const cityStates = require("../data/cityStates");

describe("Budget API routes", () => {
  beforeEach(() => {
    resetBudgetGoals();
    delete cityStates._budget_reward_test_user_;
  });

  describe("GET /api/budget/goals", () => {
    it("returns goals for a known user", async () => {
      const res = await request(app).get(
        "/api/budget/goals?currentUsername=alexr"
      );
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property("goals");
      expect(res.body.goals).to.have.property("total");
      expect(res.body.goals.total.goal).to.equal(10000);
    });

    it("returns 400 when currentUsername is missing", async () => {
      const res = await request(app).get("/api/budget/goals");
      expect(res.status).to.equal(400);
      expect(res.body).to.have.property("error");
    });

    it("returns 404 when the user is unknown", async () => {
      const res = await request(app).get(
        "/api/budget/goals?currentUsername=nobody_xyz"
      );
      expect(res.status).to.equal(404);
      expect(res.body).to.have.property("error");
    });
  });

  describe("GET /api/budget/buildings", () => {
    it("returns building health percentages for a known user", async () => {
      const res = await request(app).get(
        "/api/budget/buildings?currentUsername=alexr"
      );
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property("health");
      expect(res.body.health).to.have.all.keys(
        "cityhall",
        "houses",
        "restaurant",
        "hospital",
        "cinema"
      );
    });

    it("returns 400 when currentUsername is missing", async () => {
      const res = await request(app).get("/api/budget/buildings");
      expect(res.status).to.equal(400);
    });

    it("returns 404 for an unknown user", async () => {
      const res = await request(app).get(
        "/api/budget/buildings?currentUsername=nobody_xyz"
      );
      expect(res.status).to.equal(404);
    });
  });

  describe("GET /api/budget/transactions", () => {
    it("returns the transaction history for a known user", async () => {
      const res = await request(app).get(
        "/api/budget/transactions?currentUsername=alexr"
      );
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property("transactions");
      expect(res.body.transactions).to.have.property("food");
    });

    it("returns 400 when currentUsername is missing", async () => {
      const res = await request(app).get("/api/budget/transactions");
      expect(res.status).to.equal(400);
    });
  });

  describe("POST /api/budget/transactions", () => {
    it("adds a transaction and returns updated health and goals", async () => {
      const res = await request(app)
        .post("/api/budget/transactions")
        .send({
          currentUsername: "_route_test_user_1_",
          category: "food",
          amount: 30,
          description: "Lunch",
          date: "2026-04-01",
        });
      expect(res.status).to.equal(201);
      expect(res.body).to.have.property("message", "Transaction added");
      expect(res.body).to.have.property("health");
      expect(res.body).to.have.property("goals");
    });

    it("uses today's date when no date is provided", async () => {
      const res = await request(app).post("/api/budget/transactions").send({
        currentUsername: "_route_test_user_2_",
        category: "housing",
        amount: 100,
      });
      expect(res.status).to.equal(201);
    });

    it("returns 400 when required fields are missing", async () => {
      const res = await request(app)
        .post("/api/budget/transactions")
        .send({ category: "food", amount: 10 });
      expect(res.status).to.equal(400);
      expect(res.body).to.have.property("error");
    });

    it("returns 400 for an invalid category", async () => {
      const res = await request(app).post("/api/budget/transactions").send({
        currentUsername: "alexr",
        category: "vacations",
        amount: 10,
      });
      expect(res.status).to.equal(400);
      expect(res.body.error).to.match(/category must be one of/);
    });

    it("returns 400 when amount is not a number", async () => {
      const res = await request(app).post("/api/budget/transactions").send({
        currentUsername: "alexr",
        category: "food",
        amount: "not-a-number",
      });
      expect(res.status).to.equal(400);
      expect(res.body.error).to.match(/amount/);
    });
  });

  describe("PUT /api/budget/goals", () => {
    it("updates an existing goal and returns 200", async () => {
      const res = await request(app)
        .put("/api/budget/goals")
        .send({ currentUsername: "alexr", category: "food", goal: 2222 });
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property("message", "Goal updated");
    });

    it("returns 400 when fields are missing", async () => {
      const res = await request(app)
        .put("/api/budget/goals")
        .send({ category: "food", goal: 100 });
      expect(res.status).to.equal(400);
    });

    it("returns 404 for an unknown user", async () => {
      const res = await request(app).put("/api/budget/goals").send({
        currentUsername: "nobody_xyz",
        category: "food",
        goal: 100,
      });
      expect(res.status).to.equal(404);
    });
  });

  describe("PUT /api/budget/dates", () => {
    it("updates startDate and endDate and returns 200", async () => {
      const res = await request(app).put("/api/budget/dates").send({
        currentUsername: "alexr",
        startDate: "2027-01-01",
        endDate: "2027-12-31",
      });
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property("message", "Dates updated");
    });

    it("returns 400 when fields are missing", async () => {
      const res = await request(app)
        .put("/api/budget/dates")
        .send({ currentUsername: "alexr" });
      expect(res.status).to.equal(400);
    });

    it("returns 404 for an unknown user", async () => {
      const res = await request(app).put("/api/budget/dates").send({
        currentUsername: "nobody_xyz",
        startDate: "2027-01-01",
        endDate: "2027-12-31",
      });
      expect(res.status).to.equal(404);
    });
  });

  describe("POST /api/budget/reward", () => {
    it("returns a structured reward payload for a known user", async () => {
      const res = await request(app)
        .post("/api/budget/reward")
        .send({ currentUsername: "alexr" });
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property("message");
      expect(res.body.message).to.be.a("string");
      expect(res.body).to.have.property("rewarded");
      expect(res.body).to.have.property("currencyAwarded");
      expect(res.body).to.have.property("xpAwarded");
      expect(res.body).to.have.property("streakCount");
      expect(res.body).to.have.property("streakBonusXpPerBuilding");
      expect(res.body).to.have.property("details");
    });

    it("returns 400 when currentUsername is missing", async () => {
      const res = await request(app).post("/api/budget/reward").send({});
      expect(res.status).to.equal(400);
    });

    it("awards building XP once for a completed interval when buildings stay under budget", async () => {
      addUserBudgetGoals("_budget_reward_test_user_");

      cityStates._budget_reward_test_user_ = {
        version: 1,
        budgetRewardStatus: { claimedIntervals: {} },
        buildings: [
          {
            type: "primary",
            i: 1,
            location: { x: 0, y: 0 },
            level: 1,
            name: "City Hall",
            category: "government",
            budget: 1000,
            spent: 0,
            currentExp: 0,
            expToNextLevel: 100,
            savingGoal: "",
            history: [],
          },
          {
            type: "secondary",
            i: 2,
            location: { x: 0, y: 0 },
            level: 1,
            name: "Housing",
            category: "residential",
            budget: 1000,
            spent: 0,
            currentExp: 0,
            expToNextLevel: 100,
            savingGoal: "",
            history: [],
          },
          {
            type: "secondary",
            i: 3,
            location: { x: 0, y: 0 },
            level: 1,
            name: "Food Market",
            category: "food",
            budget: 1000,
            spent: 0,
            currentExp: 0,
            expToNextLevel: 100,
            savingGoal: "",
            history: [],
          },
          {
            type: "secondary",
            i: 4,
            location: { x: 0, y: 0 },
            level: 1,
            name: "Hospital",
            category: "health",
            budget: 1000,
            spent: 0,
            currentExp: 0,
            expToNextLevel: 100,
            savingGoal: "",
            history: [],
          },
          {
            type: "secondary",
            i: 5,
            location: { x: 0, y: 0 },
            level: 1,
            name: "Cinema",
            category: "entertainment",
            budget: 1000,
            spent: 0,
            currentExp: 0,
            expToNextLevel: 100,
            savingGoal: "",
            history: [],
          },
        ],
        decorations: [],
      };

      await request(app)
        .put("/api/budget/goals")
        .send({ currentUsername: "_budget_reward_test_user_", category: "food", goal: 500 });
      await request(app)
        .put("/api/budget/goals")
        .send({ currentUsername: "_budget_reward_test_user_", category: "housing", goal: 700 });
      await request(app)
        .put("/api/budget/goals")
        .send({ currentUsername: "_budget_reward_test_user_", category: "health", goal: 600 });
      await request(app)
        .put("/api/budget/goals")
        .send({ currentUsername: "_budget_reward_test_user_", category: "entertainment", goal: 300 });
      await request(app)
        .put("/api/budget/goals")
        .send({ currentUsername: "_budget_reward_test_user_", category: "total", goal: 2200 });
      updateBudgetGoalDates("_budget_reward_test_user_", "2026-01-01", "2026-01-31");

      const res = await request(app)
        .post("/api/budget/reward")
        .send({ currentUsername: "_budget_reward_test_user_" });

      expect(res.status).to.equal(200);
      expect(res.body.rewarded).to.equal(true);
      expect(res.body.intervalDays).to.equal(31);
      expect(res.body.streakCount).to.equal(1);
      expect(res.body.streakBonusXpPerBuilding).to.equal(0);
      expect(res.body.details).to.have.length(5);
      expect(res.body.details[0].xpAwarded).to.equal(125);
      expect(cityStates._budget_reward_test_user_.buildings[0].level).to.equal(2);
      expect(cityStates._budget_reward_test_user_.buildings[0].currentExp).to.equal(25);

      const secondRes = await request(app)
        .post("/api/budget/reward")
        .send({ currentUsername: "_budget_reward_test_user_" });

      expect(secondRes.status).to.equal(200);
      expect(secondRes.body.rewarded).to.equal(false);
      expect(secondRes.body.currencyAwarded).to.equal(0);
      expect(secondRes.body.message).to.match(/already claimed/i);
    });

    it("adds streak bonus XP for consecutive successful budget intervals", async () => {
      addUserBudgetGoals("_budget_reward_test_user_");

      cityStates._budget_reward_test_user_ = {
        version: 1,
        budgetRewardStatus: { claimedIntervals: {}, currentStreak: 0, lastRewardedIntervalEndDate: null },
        buildings: [
          {
            type: "primary",
            i: 1,
            location: { x: 0, y: 0 },
            level: 1,
            name: "City Hall",
            category: "government",
            budget: 1000,
            spent: 0,
            currentExp: 0,
            expToNextLevel: 100,
            savingGoal: "",
            history: [],
          },
          {
            type: "secondary",
            i: 2,
            location: { x: 0, y: 0 },
            level: 1,
            name: "Housing",
            category: "residential",
            budget: 1000,
            spent: 0,
            currentExp: 0,
            expToNextLevel: 100,
            savingGoal: "",
            history: [],
          },
          {
            type: "secondary",
            i: 3,
            location: { x: 0, y: 0 },
            level: 1,
            name: "Food Market",
            category: "food",
            budget: 1000,
            spent: 0,
            currentExp: 0,
            expToNextLevel: 100,
            savingGoal: "",
            history: [],
          },
          {
            type: "secondary",
            i: 4,
            location: { x: 0, y: 0 },
            level: 1,
            name: "Hospital",
            category: "health",
            budget: 1000,
            spent: 0,
            currentExp: 0,
            expToNextLevel: 100,
            savingGoal: "",
            history: [],
          },
          {
            type: "secondary",
            i: 5,
            location: { x: 0, y: 0 },
            level: 1,
            name: "Cinema",
            category: "entertainment",
            budget: 1000,
            spent: 0,
            currentExp: 0,
            expToNextLevel: 100,
            savingGoal: "",
            history: [],
          },
        ],
        decorations: [],
      };

      await request(app)
        .put("/api/budget/goals")
        .send({ currentUsername: "_budget_reward_test_user_", category: "food", goal: 500 });
      await request(app)
        .put("/api/budget/goals")
        .send({ currentUsername: "_budget_reward_test_user_", category: "housing", goal: 700 });
      await request(app)
        .put("/api/budget/goals")
        .send({ currentUsername: "_budget_reward_test_user_", category: "health", goal: 600 });
      await request(app)
        .put("/api/budget/goals")
        .send({ currentUsername: "_budget_reward_test_user_", category: "entertainment", goal: 300 });
      await request(app)
        .put("/api/budget/goals")
        .send({ currentUsername: "_budget_reward_test_user_", category: "total", goal: 2200 });

      updateBudgetGoalDates("_budget_reward_test_user_", "2026-01-01", "2026-01-31");
      const firstRes = await request(app)
        .post("/api/budget/reward")
        .send({ currentUsername: "_budget_reward_test_user_" });

      updateBudgetGoalDates("_budget_reward_test_user_", "2026-02-01", "2026-02-28");
      const secondRes = await request(app)
        .post("/api/budget/reward")
        .send({ currentUsername: "_budget_reward_test_user_" });

      expect(firstRes.status).to.equal(200);
      expect(firstRes.body.streakCount).to.equal(1);
      expect(firstRes.body.details[0].xpAwarded).to.equal(125);

      expect(secondRes.status).to.equal(200);
      expect(secondRes.body.rewarded).to.equal(true);
      expect(secondRes.body.streakCount).to.equal(2);
      expect(secondRes.body.streakBonusXpPerBuilding).to.equal(80);
      expect(secondRes.body.details[0].baseXpAwarded).to.equal(100);
      expect(secondRes.body.details[0].streakBonusXpAwarded).to.equal(80);
      expect(secondRes.body.details[0].xpAwarded).to.equal(180);
      expect(cityStates._budget_reward_test_user_.budgetRewardStatus.currentStreak).to.equal(2);
      expect(cityStates._budget_reward_test_user_.budgetRewardStatus.lastRewardedIntervalEndDate).to.equal("2026-02-28");
    });
  });
});
