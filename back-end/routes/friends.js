const express = require("express");
const router = express.Router();

const {
  getAllFriends,
  getIncomingRequests,
  getOutgoingRequests,
  searchUsers,
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  removeFriend,
  CURRENT_USER,
} = require("../data/friendsStore");

router.get("/", (req, res) => {
  res.status(200).json({ friends: getAllFriends(), currentUser: CURRENT_USER });
});

router.get("/search", (req, res) => {
  res.status(200).json({ results: searchUsers(req.query.q) });
});

router.get("/requests/incoming", (req, res) => {
  res.status(200).json({ requests: getIncomingRequests() });
});

router.get("/requests/outgoing", (req, res) => {
  res.status(200).json({ requests: getOutgoingRequests() });
});

router.post("/request", (req, res) => {
  const result = sendFriendRequest(req.body.username);

  if (result.error) {
    return res.status(result.status).json({ error: result.error });
  }

  res.status(result.status).json({
    message: "Friend request sent",
    request: result.request,
  });
});

router.post("/requests/:id/accept", (req, res) => {
  const result = acceptFriendRequest(req.params.id);

  if (result.error) {
    return res.status(result.status).json({ error: result.error });
  }

  res.status(result.status).json({
    message: "Friend request accepted",
    friend: result.friend,
  });
});

router.post("/requests/:id/decline", (req, res) => {
  const result = declineFriendRequest(req.params.id);

  if (result.error) {
    return res.status(result.status).json({ error: result.error });
  }

  res.status(result.status).json({
    message: "Friend request declined",
  });
});

router.post("/remove", (req, res) => {
  const result = removeFriend(req.body.username);

  if (result.error) {
    return res.status(result.status).json({ error: result.error });
  }

  res.status(result.status).json({
    message: "Friend removed",
    friend: result.friend,
  });
});

module.exports = router;