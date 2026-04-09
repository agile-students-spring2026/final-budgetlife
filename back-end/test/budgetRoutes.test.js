const { expect } = require("chai");
const request = require("supertest");
const app = require("../app");
const { resetBudgetGoals } = require("../data/budgetGoalsStore");

describe("Budget API routes", () => {
  beforeEach(() => {
    resetBudgetGoals();
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
    it("returns a reward message string for a known user", async () => {
      const res = await request(app)
        .post("/api/budget/reward")
        .send({ currentUsername: "alexr" });
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property("message");
      expect(res.body.message).to.be.a("string");
    });

    it("returns 400 when currentUsername is missing", async () => {
      const res = await request(app).post("/api/budget/reward").send({});
      expect(res.status).to.equal(400);
    });
  });
});
