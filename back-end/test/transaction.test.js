const { expect } = require("chai");
const User = require("../models/user");
const {
  connectTestDB,
  clearTestDB,
  closeTestDB,
} = require("./setupMongoMemory");
const {
  getTransactionHistory,
  addTransaction,
  updateTransaction,
  deleteTransaction,
} = require("../data/transaction");

async function getUserId(username) {
  const user = await User.findOne({ username }).lean();
  return user ? String(user._id) : null;
}

describe("transaction store", () => {
  before(async () => {
    await connectTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();
  });

  after(async () => {
    await closeTestDB();
  });

  describe("getTransactionHistory", () => {
    it("returns the seeded transaction object for a known user", async () => {
      const alexrId = await getUserId("alexr");
      const history = await getTransactionHistory(alexrId);

      expect(history).to.be.an("object");
      expect(history).to.have.property("food");
      expect(history.food.transaction1).to.include({
        description: "Grocery shopping",
        amount: 150,
      });
    });

    it("returns an empty object for an unknown user", async () => {
      const history = await getTransactionHistory("507f1f77bcf86cd799439011");
      expect(history).to.be.an("object");
      expect(Object.keys(history)).to.have.lengthOf(0);
    });
  });

  describe("addTransaction", () => {
    it("adds a transaction to an existing user/category", async () => {
      const alexrId = await getUserId("alexr");

      await addTransaction(
        alexrId,
        "food",
        "2026-04-01",
        "Test meal",
        42
      );

      const history = await getTransactionHistory(alexrId);
      expect(history).to.have.property("food");
      const ids = Object.keys(history.food);
      expect(ids.length).to.be.greaterThan(0);
    });

    it("creates the category bucket if it does not exist yet", async () => {
      const alexrId = await getUserId("alexr");

      await addTransaction(
        alexrId,
        "entertainment",
        "2026-04-02",
        "Concert",
        80
      );

      const history = await getTransactionHistory(alexrId);
      expect(history).to.have.property("entertainment");
      expect(Object.keys(history.entertainment).length).to.be.greaterThan(0);
    });

    it("auto-increments the transaction id within a category", async () => {
      const alexrId = await getUserId("alexr");

      await addTransaction(alexrId, "food", "2026-04-01", "a", 1);
      await addTransaction(alexrId, "food", "2026-04-02", "b", 2);
      await addTransaction(alexrId, "food", "2026-04-03", "c", 3);

      const history = await getTransactionHistory(alexrId);
      const food = history.food;

      expect(Object.keys(food).length).to.be.at.least(3);
      expect(food).to.have.property("transaction1");
      expect(food).to.have.property("transaction2");
      expect(food).to.have.property("transaction3");
    });
  });

  describe("updateTransaction", () => {
    it("overwrites an existing transaction's fields", async () => {
      const alexrId = await getUserId("alexr");

      await addTransaction(
        alexrId,
        "housing",
        "2026-04-01",
        "Rent",
        1000
      );

      await updateTransaction(
        alexrId,
        "housing",
        "transaction1",
        "2026-04-05",
        "Rent (corrected)",
        1200
      );

      const history = await getTransactionHistory(alexrId);
      const txn = history.housing.transaction1;

      expect(txn).to.deep.equal({
        date: "2026-04-05",
        description: "Rent (corrected)",
        amount: 1200,
      });
    });

    it("is a no-op when the user, category, or transaction does not exist", async () => {
      let err = null;
      try {
        await updateTransaction(
          "507f1f77bcf86cd799439011",
          "food",
          "transaction1",
          "2026-04-01",
          "x",
          1
        );
      } catch (e) {
        err = e;
      }
      expect(err).to.equal(null);
    });
  });

  describe("deleteTransaction", () => {
    it("removes an existing transaction", async () => {
      const alexrId = await getUserId("alexr");

      await addTransaction(alexrId, "health", "2026-04-01", "Doc", 60);
      await deleteTransaction(alexrId, "health", "transaction1");

      const history = await getTransactionHistory(alexrId);
      const health = history.health || {};
      expect(health).to.not.have.property("transaction1");
    });

    it("is a no-op for a missing transaction", async () => {
      let err = null;
      try {
        await deleteTransaction("507f1f77bcf86cd799439011", "food", "transaction1");
      } catch (e) {
        err = e;
      }
      expect(err).to.equal(null);
    });
  });
});