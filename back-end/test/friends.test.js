const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require("../app");
const { resetFriends } = require("../data/friendsStore");

const expect = chai.expect;
chai.use(chaiHttp);

describe("Friends API", () => {
  beforeEach(() => {
    resetFriends();
  });

  describe("GET /api/friends", () => {
    it("should return all friends", async () => {
      const res = await chai.request(app).get("/api/friends");

      expect(res).to.have.status(200);
      expect(res.body).to.have.property("friends");
      expect(res.body.friends).to.be.an("array");
      expect(res.body.friends).to.have.lengthOf(2);
    });
  });

  describe("GET /api/friends/search", () => {
    it("should return matching non-friends", async () => {
      const res = await chai.request(app).get("/api/friends/search?q=case");

      expect(res).to.have.status(200);
      expect(res.body).to.have.property("results");
      expect(res.body.results).to.be.an("array");
      expect(res.body.results[0].username).to.equal("Casey");
    });

    it("should return an empty array for blank query", async () => {
      const res = await chai.request(app).get("/api/friends/search?q=");

      expect(res).to.have.status(200);
      expect(res.body.results).to.be.an("array").that.is.empty;
    });
  });

  describe("POST /api/friends/add", () => {
    it("should add a new friend", async () => {
      const res = await chai.request(app).post("/api/friends/add").send({
        username: "Casey",
      });

      expect(res).to.have.status(201);
      expect(res.body).to.have.property("friend");
      expect(res.body.friend.username).to.equal("Casey");
    });

    it("should return 404 if user does not exist", async () => {
      const res = await chai.request(app).post("/api/friends/add").send({
        username: "NotARealUser",
      });

      expect(res).to.have.status(404);
      expect(res.body).to.have.property("error");
    });

    it("should return 409 if user is already a friend", async () => {
      const res = await chai.request(app).post("/api/friends/add").send({
        username: "User1",
      });

      expect(res).to.have.status(409);
      expect(res.body).to.have.property("error");
    });
  });

  describe("POST /api/friends/remove", () => {
    it("should remove an existing friend", async () => {
      const res = await chai.request(app).post("/api/friends/remove").send({
        username: "User1",
      });

      expect(res).to.have.status(200);
      expect(res.body).to.have.property("friend");
      expect(res.body.friend.username).to.equal("User1");
    });

    it("should return 404 if friend does not exist", async () => {
      const res = await chai.request(app).post("/api/friends/remove").send({
        username: "Casey",
      });

      expect(res).to.have.status(404);
      expect(res.body).to.have.property("error");
    });

    it("should return 400 if username is missing", async () => {
      const res = await chai.request(app).post("/api/friends/remove").send({});

      expect(res).to.have.status(400);
      expect(res.body).to.have.property("error");
    });
  });
});