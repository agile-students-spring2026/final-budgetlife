const { expect } = require("chai");
const request = require("supertest");

const { connectTestDB, clearTestDB, closeTestDB } = require("./setupMongoMemory");
const app = require("../app");
const User = require("../models/user");

describe("auth player state routes", () => {
  const username = "playerstateuser";

  before(async () => {
    await connectTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();

    await User.deleteMany({ username });
    await User.create({
      username,
      email: "playerstate@example.com",
      password: "hashed-password",
      friends: [],
    });
  });

  after(async () => {
    await closeTestDB();
  });

  it("returns the default player state for a user", async () => {
    const response = await request(app)
      .get("/api/auth/player-state")
      .query({ currentUsername: username })
      .expect(200);

    expect(response.body.playerState).to.deep.equal({
      money: 1000,
      inventory: [],
      equippedItems: {
        collar: null,
        eyewear: null,
        hat: null,
        earring: null,
      },
    });
  });

  it("updates and returns persisted player state", async () => {
    const nextState = {
      money: 740,
      inventory: ["hat-cap", "eyewear-glasses"],
      equippedItems: {
        collar: null,
        eyewear: "eyewear-glasses",
        hat: "hat-cap",
        earring: null,
      },
    };

    const updateResponse = await request(app)
      .put("/api/auth/player-state")
      .send({ currentUsername: username, playerState: nextState })
      .expect(200);

    expect(updateResponse.body.playerState).to.deep.equal(nextState);

    const reloadResponse = await request(app)
      .get("/api/auth/player-state")
      .query({ currentUsername: username })
      .expect(200);

    expect(reloadResponse.body.playerState).to.deep.equal(nextState);
  });
}); 