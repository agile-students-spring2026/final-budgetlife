const { expect } = require("chai");
const {
  getTransactionHistory,
  addTransaction,
  updateTransaction,
  deleteTransaction,
} = require("../data/transaction");

describe("transaction store", () => {
  describe("getTransactionHistory", () => {
    it("returns the seeded transaction object for a known user", () => {
      const history = getTransactionHistory("alexr");
      expect(history).to.be.an("object");
      expect(history).to.have.property("food");
      expect(history.food.transaction1).to.include({
        description: "Grocery shopping",
        amount: 150,
      });
    });

    it("returns an empty object for an unknown user", () => {
      const history = getTransactionHistory("nobody_xyz_get");
      expect(history).to.be.an("object");
      expect(Object.keys(history)).to.have.lengthOf(0);
    });
  });

  describe("addTransaction", () => {
    it("adds a transaction to an existing user/category", () => {
      // use a fresh test user so the seed is not polluted
      addTransaction(
        "_txn_test_user_1_",
        "food",
        "2026-04-01",
        "Test meal",
        42
      );
      const history = getTransactionHistory("_txn_test_user_1_");
      expect(history).to.have.property("food");
      const ids = Object.keys(history.food);
      expect(ids).to.have.lengthOf(1);
      expect(history.food[ids[0]]).to.deep.equal({
        date: "2026-04-01",
        description: "Test meal",
        amount: 42,
      });
    });

    it("creates the category bucket if it does not exist yet", () => {
      addTransaction(
        "_txn_test_user_2_",
        "entertainment",
        "2026-04-02",
        "Concert",
        80
      );
      const history = getTransactionHistory("_txn_test_user_2_");
      expect(history).to.have.property("entertainment");
      expect(Object.keys(history.entertainment)).to.have.lengthOf(1);
    });

    it("auto-increments the transaction id within a category", () => {
      addTransaction("_txn_test_user_3_", "food", "2026-04-01", "a", 1);
      addTransaction("_txn_test_user_3_", "food", "2026-04-02", "b", 2);
      addTransaction("_txn_test_user_3_", "food", "2026-04-03", "c", 3);
      const food = getTransactionHistory("_txn_test_user_3_").food;
      expect(Object.keys(food)).to.have.lengthOf(3);
      expect(food).to.have.property("transaction1");
      expect(food).to.have.property("transaction2");
      expect(food).to.have.property("transaction3");
    });
  });

  describe("updateTransaction", () => {
    it("overwrites an existing transaction's fields", () => {
      addTransaction(
        "_txn_test_user_4_",
        "housing",
        "2026-04-01",
        "Rent",
        1000
      );
      updateTransaction(
        "_txn_test_user_4_",
        "housing",
        "transaction1",
        "2026-04-05",
        "Rent (corrected)",
        1200
      );
      const txn = getTransactionHistory("_txn_test_user_4_").housing
        .transaction1;
      expect(txn).to.deep.equal({
        date: "2026-04-05",
        description: "Rent (corrected)",
        amount: 1200,
      });
    });

    it("is a no-op when the user, category, or transaction does not exist", () => {
      // does not throw, does not create new entries
      expect(() =>
        updateTransaction(
          "_unknown_",
          "food",
          "transaction1",
          "2026-04-01",
          "x",
          1
        )
      ).to.not.throw();
      const history = getTransactionHistory("_unknown_");
      expect(Object.keys(history)).to.have.lengthOf(0);
    });
  });

  describe("deleteTransaction", () => {
    it("removes an existing transaction", () => {
      addTransaction("_txn_test_user_5_", "health", "2026-04-01", "Doc", 60);
      deleteTransaction("_txn_test_user_5_", "health", "transaction1");
      const health = getTransactionHistory("_txn_test_user_5_").health;
      expect(health).to.not.have.property("transaction1");
    });

    it("is a no-op for a missing transaction", () => {
      expect(() =>
        deleteTransaction("_unknown_", "food", "transaction1")
      ).to.not.throw();
    });
  });
});
