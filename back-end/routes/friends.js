const express = require("express");
const router = express.Router();

const {
  getAllFriends,
  searchUsers,
  addFriend,
  removeFriend,
} = require("../data/friendsStore");

// GET /api/friends
router.get("/", (req, res) => {
  const friends = getAllFriends();
  res.status(200).json({ friends });
});

// GET /api/friends/search?q=...
router.get("/search", (req, res) => {
  const results = searchUsers(req.query.q);
  res.status(200).json({ results });
});

// POST /api/friends/add
router.post("/add", (req, res) => {
  const result = addFriend(req.body.username);

  if (result.error) {
    return res.status(result.status).json({ error: result.error });
  }

  res.status(result.status).json({
    message: "Friend added",
    friend: result.friend,
  });
});

// POST /api/friends/remove
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