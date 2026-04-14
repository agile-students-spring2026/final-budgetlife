const { expect } = require("chai");
const request = require("supertest");
const app = require("../app");
const { resetFriends } = require("../data/friendsStore");

describe("Friends API", () => {
  beforeEach(() => {
    resetFriends();
  });

  describe("GET /api/friends", () => {
    it("returns all friends for a user", async () => {
      const res = await request(app).get("/api/friends?currentUsername=alexr");

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property("friends");
      expect(res.body.friends).to.be.an("array");
      expect(res.body.friends).to.have.lengthOf(2);
      expect(res.body.friends.map((f) => f.username)).to.include("jordy88");
      expect(res.body.friends.map((f) => f.username)).to.include("caseybuilds");
    });

    it("returns an empty array for a user with no friends", async () => {
      const res = await request(app).get(
        "/api/friends?currentUsername=taylortracks"
      );

      expect(res.status).to.equal(200);
      expect(res.body.friends).to.be.an("array").that.is.empty;
    });
  });

  describe("GET /api/friends/search", () => {
    it("returns matching non-friends", async () => {
      const res = await request(app).get(
        "/api/friends/search?currentUsername=alexr&q=tay"
      );

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property("results");
      expect(res.body.results).to.be.an("array");
      expect(res.body.results.map((u) => u.username)).to.include("taylortracks");
    });

    it("does not return existing friends", async () => {
      const res = await request(app).get(
        "/api/friends/search?currentUsername=alexr&q=jor"
      );

      expect(res.status).to.equal(200);
      expect(res.body.results).to.be.an("array").that.is.empty;
    });

    it("returns an empty array for a blank query", async () => {
      const res = await request(app).get(
        "/api/friends/search?currentUsername=alexr&q="
      );

      expect(res.status).to.equal(200);
      expect(res.body.results).to.be.an("array").that.is.empty;
    });
  });

  describe("GET /api/friends/requests/incoming", () => {
    it("returns incoming pending requests", async () => {
      const res = await request(app).get(
        "/api/friends/requests/incoming?currentUsername=alexr"
      );

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property("requests");
      expect(res.body.requests).to.be.an("array");
      expect(res.body.requests).to.have.lengthOf(2);
      expect(res.body.requests.map((r) => r.fromUsername)).to.include("morgmoney");
      expect(res.body.requests.map((r) => r.fromUsername)).to.include("rileybudgets");
    });
  });

  describe("GET /api/friends/requests/outgoing", () => {
    it("returns outgoing pending requests after sending one", async () => {
      await request(app).post("/api/friends/request").send({
        currentUsername: "alexr",
        username: "taylortracks",
      });

      const res = await request(app).get(
        "/api/friends/requests/outgoing?currentUsername=alexr"
      );

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property("requests");
      expect(res.body.requests).to.be.an("array");
      expect(res.body.requests.map((r) => r.toUsername)).to.include("taylortracks");
    });
  });

  describe("POST /api/friends/request", () => {
    it("sends a friend request", async () => {
      const res = await request(app).post("/api/friends/request").send({
        currentUsername: "alexr",
        username: "taylortracks",
      });

      expect(res.status).to.equal(201);
      expect(res.body).to.have.property("message", "Friend request sent");
      expect(res.body).to.have.property("request");
      expect(res.body.request.fromUsername).to.equal("alexr");
      expect(res.body.request.toUsername).to.equal("taylortracks");
    });

    it("returns 400 when currentUsername is missing", async () => {
      const res = await request(app).post("/api/friends/request").send({
        username: "taylortracks",
      });

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property("error");
    });

    it("returns 400 when username is missing", async () => {
      const res = await request(app).post("/api/friends/request").send({
        currentUsername: "alexr",
      });

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property("error");
    });

    it("returns 400 when sending a request to yourself", async () => {
      const res = await request(app).post("/api/friends/request").send({
        currentUsername: "alexr",
        username: "alexr",
      });

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property("error");
    });

    it("returns 404 when target user does not exist", async () => {
      const res = await request(app).post("/api/friends/request").send({
        currentUsername: "alexr",
        username: "notarealuser",
      });

      expect(res.status).to.equal(404);
      expect(res.body).to.have.property("error");
    });

    it("returns 409 when target user is already a friend", async () => {
      const res = await request(app).post("/api/friends/request").send({
        currentUsername: "alexr",
        username: "jordy88",
      });

      expect(res.status).to.equal(409);
      expect(res.body).to.have.property("error");
    });

    it("returns 409 when a pending request already exists", async () => {
      await request(app).post("/api/friends/request").send({
        currentUsername: "alexr",
        username: "taylortracks",
      });

      const res = await request(app).post("/api/friends/request").send({
        currentUsername: "alexr",
        username: "taylortracks",
      });

      expect(res.status).to.equal(409);
      expect(res.body).to.have.property("error");
    });
  });

  describe("POST /api/friends/requests/:id/accept", () => {
    it("accepts an incoming friend request", async () => {
      const incoming = await request(app).get(
        "/api/friends/requests/incoming?currentUsername=alexr"
      );
      const requestId = incoming.body.requests[0].id;

      const res = await request(app)
        .post(`/api/friends/requests/${requestId}/accept`)
        .send({ currentUsername: "alexr" });

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property("message", "Friend request accepted");
      expect(res.body).to.have.property("friend");
      expect(res.body.friend.username).to.be.oneOf(["morgmoney", "rileybudgets"]);

      const friendsRes = await request(app).get("/api/friends?currentUsername=alexr");
      expect(friendsRes.body.friends.map((f) => f.username)).to.include(
        res.body.friend.username
      );
    });

    it("returns 404 for a missing request id", async () => {
      const res = await request(app)
        .post("/api/friends/requests/999999/accept")
        .send({ currentUsername: "alexr" });

      expect(res.status).to.equal(404);
      expect(res.body).to.have.property("error");
    });

    it("returns 403 when trying to accept someone else's request", async () => {
      const incoming = await request(app).get(
        "/api/friends/requests/incoming?currentUsername=alexr"
      );
      const requestId = incoming.body.requests[0].id;

      const res = await request(app)
        .post(`/api/friends/requests/${requestId}/accept`)
        .send({ currentUsername: "jordy88" });

      expect(res.status).to.equal(403);
      expect(res.body).to.have.property("error");
    });
  });

  describe("POST /api/friends/requests/:id/decline", () => {
    it("declines an incoming friend request", async () => {
      const incoming = await request(app).get(
        "/api/friends/requests/incoming?currentUsername=alexr"
      );
      const requestId = incoming.body.requests[0].id;

      const res = await request(app)
        .post(`/api/friends/requests/${requestId}/decline`)
        .send({ currentUsername: "alexr" });

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property("message", "Friend request declined");

      const after = await request(app).get(
        "/api/friends/requests/incoming?currentUsername=alexr"
      );
      expect(after.body.requests.map((r) => r.id)).to.not.include(requestId);
    });

    it("returns 404 for a missing request id", async () => {
      const res = await request(app)
        .post("/api/friends/requests/999999/decline")
        .send({ currentUsername: "alexr" });

      expect(res.status).to.equal(404);
      expect(res.body).to.have.property("error");
    });

    it("returns 403 when trying to decline someone else's request", async () => {
      const incoming = await request(app).get(
        "/api/friends/requests/incoming?currentUsername=alexr"
      );
      const requestId = incoming.body.requests[0].id;

      const res = await request(app)
        .post(`/api/friends/requests/${requestId}/decline`)
        .send({ currentUsername: "jordy88" });

      expect(res.status).to.equal(403);
      expect(res.body).to.have.property("error");
    });
  });

  describe("POST /api/friends/remove", () => {
    it("removes an existing friend", async () => {
      const res = await request(app).post("/api/friends/remove").send({
        currentUsername: "alexr",
        username: "jordy88",
      });

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property("message", "Friend removed");
      expect(res.body).to.have.property("friend");
      expect(res.body.friend.username).to.equal("jordy88");
    });

    it("returns 400 if currentUsername is missing", async () => {
      const res = await request(app).post("/api/friends/remove").send({
        username: "jordy88",
      });

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property("error");
    });

    it("returns 400 if username is missing", async () => {
      const res = await request(app).post("/api/friends/remove").send({
        currentUsername: "alexr",
      });

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property("error");
    });

    it("returns 404 if friend does not exist", async () => {
      const res = await request(app).post("/api/friends/remove").send({
        currentUsername: "alexr",
        username: "taylortracks",
      });

      expect(res.status).to.equal(404);
      expect(res.body).to.have.property("error");
    });
  });
});