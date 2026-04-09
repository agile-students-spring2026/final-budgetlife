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
} = require("../data/friendsStore");

router.get("/", (req, res) => {
  const { currentUsername } = req.query;

  const friends = getAllFriends(currentUsername);

  res.status(200).json({
    friends,
    currentUser: currentUsername,
  });
});

router.get("/search", (req, res) => {
  const { currentUsername, q } = req.query;

  const results = searchUsers(currentUsername, q);

  res.status(200).json({ results });
});

router.get("/requests/incoming", (req, res) => {
  const { currentUsername } = req.query;

  const requests = getIncomingRequests(currentUsername);

  res.status(200).json({ requests });
});

router.get("/requests/outgoing", (req, res) => {
  const { currentUsername } = req.query;

  const requests = getOutgoingRequests(currentUsername);

  res.status(200).json({ requests });
});

router.post("/request", (req, res) => {
  const { currentUsername, username } = req.body;

  const result = sendFriendRequest(currentUsername, username);

  if (result.error) {
    return res.status(result.status).json({ error: result.error });
  }

  res.status(result.status).json({
    message: "Friend request sent",
    request: result.request,
  });
});

router.post("/requests/:id/accept", (req, res) => {
  const { currentUsername } = req.body;

  const result = acceptFriendRequest(currentUsername, req.params.id);

  if (result.error) {
    return res.status(result.status).json({ error: result.error });
  }

  res.status(result.status).json({
    message: "Friend request accepted",
    friend: result.friend,
  });
});

router.post("/requests/:id/decline", (req, res) => {
  const { currentUsername } = req.body;

  const result = declineFriendRequest(currentUsername, req.params.id);

  if (result.error) {
    return res.status(result.status).json({ error: result.error });
  }

  res.status(result.status).json({
    message: "Friend request declined",
  });
});

router.post("/remove", (req, res) => {
  const { currentUsername, username } = req.body;

  const result = removeFriend(currentUsername, username);

  if (result.error) {
    return res.status(result.status).json({ error: result.error });
  }

  res.status(result.status).json({
    message: "Friend removed",
    friend: result.friend,
  });
});

module.exports = router;