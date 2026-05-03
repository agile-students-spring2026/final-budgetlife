const { expect } = require("chai");
const {
  getTransactionHistory,
  addTransaction,
  updateTransaction,
  deleteTransaction,
} = require("../data/transaction");

describe("transaction store", () => {
  describe("getTransactionHistory", () => {
    it("returns the seeded transaction object for a known user", async () => {
      const history = await getTransactionHistory("alexr");
      expect(history).to.be.an("object");
      expect(history).to.have.property("food");
      expect(history.food.transaction1).to.include({
        description: "Grocery shopping",
        amount: 150,
      });
    });

    it("returns an empty object for an unknown user", async () => {
      const history = await getTransactionHistory("nobody_xyz_get");
      expect(history).to.be.an("object");
      expect(Object.keys(history)).to.have.lengthOf(0);
    });
  });

  describe("addTransaction", () => {
    it("adds a transaction to an existing user/category", async () => {
      await addTransaction(
        "_txn_test_user_1_",
        "food",
        "2026-04-01",
        "Test meal",
        42
      );

      const history = await getTransactionHistory("_txn_test_user_1_");
      expect(history).to.have.property("food");
      const ids = Object.keys(history.food);
      expect(ids).to.have.lengthOf(1);
      expect(history.food[ids[0]]).to.deep.equal({
        date: "2026-04-01",
        description: "Test meal",
        amount: 42,
      });
    });

    it("creates the category bucket if it does not exist yet", async () => {
      await addTransaction(
        "_txn_test_user_2_",
        "entertainment",
        "2026-04-02",
        "Concert",
        80
      );

      const history = await getTransactionHistory("_txn_test_user_2_");
      expect(history).to.have.property("entertainment");
      expect(Object.keys(history.entertainment)).to.have.lengthOf(1);
    });

    it("auto-increments the transaction id within a category", async () => {
      await addTransaction("_txn_test_user_3_", "food", "2026-04-01", "a", 1);
      await addTransaction("_txn_test_user_3_", "food", "2026-04-02", "b", 2);
      await addTransaction("_txn_test_user_3_", "food", "2026-04-03", "c", 3);

      const history = await getTransactionHistory("_txn_test_user_3_");
      const food = history.food;

      expect(Object.keys(food)).to.have.lengthOf(3);
      expect(food).to.have.property("transaction1");
      expect(food).to.have.property("transaction2");
      expect(food).to.have.property("transaction3");
    });
  });

  describe("updateTransaction", () => {
    it("overwrites an existing transaction's fields", async () => {
      await addTransaction(
        "_txn_test_user_4_",
        "housing",
        "2026-04-01",
        "Rent",
        1000
      );

      await updateTransaction(
        "_txn_test_user_4_",
        "housing",
        "transaction1",
        "2026-04-05",
        "Rent (corrected)",
        1200
      );

      const history = await getTransactionHistory("_txn_test_user_4_");
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
          "_unknown_",
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

      const history = await getTransactionHistory("_unknown_");
      expect(Object.keys(history)).to.have.lengthOf(0);
    });
  });

  describe("deleteTransaction", () => {
    it("removes an existing transaction", async () => {
      await addTransaction("_txn_test_user_5_", "health", "2026-04-01", "Doc", 60);
      await deleteTransaction("_txn_test_user_5_", "health", "transaction1");

      const history = await getTransactionHistory("_txn_test_user_5_");
      const health = history.health || {};
      expect(health).to.not.have.property("transaction1");
    });

    it("is a no-op for a missing transaction", async () => {
      let err = null;

      try {
        await deleteTransaction("_unknown_", "food", "transaction1");
      } catch (e) {
        err = e;
      }

      expect(err).to.equal(null);
    });
  });
});