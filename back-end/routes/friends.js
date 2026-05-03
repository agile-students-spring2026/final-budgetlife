const express = require("express");
const router = express.Router();
const requireAuth = require("../middleware/requireAuth");
const User = require("../models/user");
const FriendRequest = require("../models/friendRequest");

router.get("/", requireAuth, async (req, res) => {
  try {
    const currentUsername = req.user.username;

    const currentUser = await User.findOne({ username: currentUsername });
    if (!currentUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const friendIds = (currentUser.friends || []).map((friend) => friend.user).filter(Boolean);
    const friendUsers = await User.find({ _id: { $in: friendIds } }).select(
      "_id username playerState"
    );
    const friendUserById = new Map(
      friendUsers.map((friendUser) => [String(friendUser._id), friendUser])
    );

    const friends = (currentUser.friends || []).map((friend) => {
      const friendUser = friendUserById.get(String(friend.user));

      return {
        ...friend.toObject(),
        playerState: friendUser?.playerState || null,
      };
    });

    res.status(200).json({
      friends,
      currentUser: currentUsername,
    });
  } catch (err) {
    console.error("Failed to get friends:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/search", requireAuth, async (req, res) => {
  try {
    const currentUsername = req.user.username;
    const q = (req.query.q || "").trim().toLowerCase();

    if (!q) {
      return res.status(200).json({ results: [] });
    }

    const currentUser = await User.findOne({ username: currentUsername });
    if (!currentUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const friendUsernames = new Set(
      (currentUser.friends || []).map((f) => f.username.toLowerCase())
    );

    const pendingRequests = await FriendRequest.find({
      status: "pending",
      $or: [{ fromUser: currentUser._id }, { toUser: currentUser._id }],
    }).populate("fromUser toUser", "username");

    const pendingUsernames = new Set();
    for (const request of pendingRequests) {
      if (request.fromUser?.username) {
        pendingUsernames.add(request.fromUser.username.toLowerCase());
      }
      if (request.toUser?.username) {
        pendingUsernames.add(request.toUser.username.toLowerCase());
      }
    }

    const users = await User.find({
      username: { $regex: q, $options: "i" },
    }).select("_id username name");

    const results = users.filter((user) => {
      const uname = user.username.toLowerCase();
      if (uname === currentUsername.toLowerCase()) return false;
      if (friendUsernames.has(uname)) return false;
      if (pendingUsernames.has(uname)) return false;
      return true;
    });

    res.status(200).json({ results });
  } catch (err) {
    console.error("Failed to search users:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/requests/incoming", requireAuth, async (req, res) => {
  try {
    const currentUsername = req.user.username;

    const currentUser = await User.findOne({ username: currentUsername });
    if (!currentUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const requests = await FriendRequest.find({
      toUser: currentUser._id,
      status: "pending",
    }).populate("fromUser", "_id username name");

    const formatted = requests.map((request) => ({
      id: request._id.toString(),
      fromUsername: request.fromUser.username,
      toUsername: currentUsername,
      status: request.status,
      fromUser: {
        id: request.fromUser._id,
        username: request.fromUser.username,
        name: request.fromUser.name,
      },
    }));

    res.status(200).json({ requests: formatted });
  } catch (err) {
    console.error("Failed to get incoming requests:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/requests/outgoing", requireAuth, async (req, res) => {
  try {
    const currentUsername = req.user.username;

    const currentUser = await User.findOne({ username: currentUsername });
    if (!currentUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const requests = await FriendRequest.find({
      fromUser: currentUser._id,
      status: "pending",
    }).populate("toUser", "_id username name");

    const formatted = requests.map((request) => ({
      id: request._id.toString(),
      fromUsername: currentUsername,
      toUsername: request.toUser.username,
      status: request.status,
      toUser: {
        id: request.toUser._id,
        username: request.toUser.username,
        name: request.toUser.name,
      },
    }));

    res.status(200).json({ requests: formatted });
  } catch (err) {
    console.error("Failed to get outgoing requests:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/request", requireAuth, async (req, res) => {
  try {
    const currentUsername = req.user.username;
    const cleanedTarget = (req.body.username || "").trim().toLowerCase();

    if (!cleanedTarget) {
      return res.status(400).json({ error: "Username is required" });
    }

    if (cleanedTarget === currentUsername.toLowerCase()) {
      return res.status(400).json({ error: "You cannot send a request to yourself" });
    }

    const currentUser = await User.findOne({ username: currentUsername });
    const targetUser = await User.findOne({ username: cleanedTarget });

    if (!currentUser) {
      return res.status(404).json({ error: "Current user not found" });
    }

    if (!targetUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const alreadyFriend = (currentUser.friends || []).some(
      (friend) => friend.username.toLowerCase() === cleanedTarget
    );

    if (alreadyFriend) {
      return res.status(409).json({ error: "User is already a friend" });
    }

    const existingPending = await FriendRequest.findOne({
      status: "pending",
      $or: [
        { fromUser: currentUser._id, toUser: targetUser._id },
        { fromUser: targetUser._id, toUser: currentUser._id },
      ],
    });

    if (existingPending) {
      return res.status(409).json({ error: "A pending request already exists" });
    }

    const requestDoc = await FriendRequest.create({
      fromUser: currentUser._id,
      toUser: targetUser._id,
      status: "pending",
    });

    res.status(201).json({
      message: "Friend request sent",
      request: {
        id: requestDoc._id.toString(),
        fromUsername: currentUser.username,
        toUsername: targetUser.username,
        status: requestDoc.status,
      },
    });
  } catch (err) {
    console.error("Failed to send friend request:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/requests/:id/accept", requireAuth, async (req, res) => {
  try {
    const currentUsername = req.user.username;
    const requestId = req.params.id;

    const currentUser = await User.findOne({ username: currentUsername });
    if (!currentUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const requestDoc = await FriendRequest.findOne({
      _id: requestId,
      toUser: currentUser._id,
      status: "pending",
    }).populate("fromUser", "_id username name");

    if (!requestDoc) {
      return res.status(404).json({ error: "Friend request not found" });
    }

    const sender = await User.findById(requestDoc.fromUser._id);
    if (!sender) {
      return res.status(404).json({ error: "One or more users in this request no longer exist" });
    }

    const alreadyFriend = (currentUser.friends || []).some(
      (friend) => friend.username.toLowerCase() === sender.username.toLowerCase()
    );

    if (!alreadyFriend) {
      currentUser.friends.push({
        user: sender._id,
        username: sender.username,
        name: sender.name || sender.username,
        info: "Friends for less than a day",
      });
    }

    const senderAlreadyHasCurrent = (sender.friends || []).some(
      (friend) => friend.username.toLowerCase() === currentUser.username.toLowerCase()
    );

    if (!senderAlreadyHasCurrent) {
      sender.friends.push({
        user: currentUser._id,
        username: currentUser.username,
        name: currentUser.name || currentUser.username,
        info: "Friends for less than a day",
      });
    }

    requestDoc.status = "accepted";

    await currentUser.save();
    await sender.save();
    await requestDoc.deleteOne();

    res.status(200).json({
      message: "Friend request accepted",
      friend: {
        id: sender._id,
        username: sender.username,
        name: sender.name || sender.username,
        info: "Friends for less than a day",
        playerState: sender.playerState || null,
      },
    });
  } catch (err) {
    console.error("Failed to accept friend request:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/requests/:id/decline", requireAuth, async (req, res) => {
  try {
    const currentUsername = req.user.username;
    const requestId = req.params.id;

    const currentUser = await User.findOne({ username: currentUsername });
    if (!currentUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const requestDoc = await FriendRequest.findOne({
      _id: requestId,
      toUser: currentUser._id,
      status: "pending",
    });

    if (!requestDoc) {
      return res.status(404).json({ error: "Friend request not found" });
    }

    requestDoc.status = "declined";
    await requestDoc.deleteOne();

    res.status(200).json({
      message: "Friend request declined",
    });
  } catch (err) {
    console.error("Failed to decline friend request:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/remove", requireAuth, async (req, res) => {
  try {
    const currentUsername = req.user.username;
    const cleanedTarget = (req.body.username || "").trim().toLowerCase();

    if (!cleanedTarget) {
      return res.status(400).json({ error: "Username is required" });
    }

    const currentUser = await User.findOne({ username: currentUsername });
    const targetUser = await User.findOne({ username: cleanedTarget });

    if (!currentUser) {
      return res.status(404).json({ error: "Current user not found" });
    }

    if (!targetUser) {
      return res.status(404).json({ error: "Friend not found" });
    }

    const existingFriend = (currentUser.friends || []).find(
      (friend) => friend?.username?.toLowerCase() === cleanedTarget
    );

    if (!existingFriend) {
      return res.status(404).json({ error: "Friend not found" });
    }

    currentUser.friends = (currentUser.friends || []).filter(
      (friend) => friend?.username?.toLowerCase() !== cleanedTarget
    );

    targetUser.friends = (targetUser.friends || []).filter(
      (friend) =>
        friend?.username?.toLowerCase() !== currentUser.username.toLowerCase()
    );

    await currentUser.save();
    await targetUser.save();

    res.status(200).json({
      message: "Friend removed",
      friend: existingFriend,
    });
  } catch (err) {
    console.error("Failed to remove friend:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;