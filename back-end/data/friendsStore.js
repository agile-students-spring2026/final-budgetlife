const initialFriendsByUser = {
  alexr: [
    { id: 2, username: "jordy88", name: "Jordan", info: "Friends for 3 years" },
    { id: 3, username: "caseybuilds", name: "Casey", info: "Friends for 8 months" },
  ],
  jordy88: [
    { id: 1, username: "alexr", name: "Alex", info: "Friends for 3 years" },
  ],
  caseybuilds: [
    { id: 1, username: "alexr", name: "Alex", info: "Friends for 8 months" },
  ],
  taylortracks: [],
  morgmoney: [],
  rileybudgets: [],
  jamiecity: [],
  averyplays: [],
  parkerplans: [],
  skylerstacks: [],
};

const initialUsers = [
  { id: 1, username: "alexr", name: "Alex" },
  { id: 2, username: "jordy88", name: "Jordan" },
  { id: 3, username: "caseybuilds", name: "Casey" },
  { id: 4, username: "taylortracks", name: "Taylor" },
  { id: 5, username: "morgmoney", name: "Morgan" },
  { id: 6, username: "rileybudgets", name: "Riley" },
  { id: 7, username: "jamiecity", name: "Jamie" },
  { id: 8, username: "averyplays", name: "Avery" },
  { id: 9, username: "parkerplans", name: "Parker" },
  { id: 10, username: "skylerstacks", name: "Skyler" },
];

const initialFriendRequests = [
  {
    id: 2,
    fromUsername: "morgmoney",
    toUsername: "alexr",
    status: "pending",
  },
  {
    id: 3,
    fromUsername: "rileybudgets",
    toUsername: "alexr",
    status: "pending",
  },
];

let users = JSON.parse(JSON.stringify(initialUsers));
let friendsByUser = JSON.parse(JSON.stringify(initialFriendsByUser));
let friendRequests = JSON.parse(JSON.stringify(initialFriendRequests));

function normalizeUsername(username) {
  return (username || "").trim().toLowerCase();
}

function ensureUserFriendList(username) {
  const cleaned = normalizeUsername(username);

  if (!friendsByUser[cleaned]) {
    friendsByUser[cleaned] = [];
  }

  return friendsByUser[cleaned];
}

function getUserByUsername(username) {
  const cleaned = normalizeUsername(username);
  return users.find((user) => user.username.toLowerCase() === cleaned);
}

function addUserIfMissing(user) {
  const cleaned = normalizeUsername(user.username);

  const existing = users.find(
    (existingUser) => existingUser.username.toLowerCase() === cleaned
  );

  if (!existing) {
    users.push({
      id: user.id,
      username: user.username,
      name: user.name || user.displayName || user.username,
    });
  }

  ensureUserFriendList(cleaned);
}

function createInitialFriendStateForUser(user) {
  addUserIfMissing(user);
  ensureUserFriendList(user.username);
}

function getAllFriends(currentUsername) {
  return ensureUserFriendList(currentUsername);
}

function getIncomingRequests(currentUsername) {
  const cleanedCurrent = normalizeUsername(currentUsername);

  return friendRequests.filter(
    (request) =>
      request.toUsername.toLowerCase() === cleanedCurrent &&
      request.status === "pending"
  );
}

function getOutgoingRequests(currentUsername) {
  const cleanedCurrent = normalizeUsername(currentUsername);

  return friendRequests.filter(
    (request) =>
      request.fromUsername.toLowerCase() === cleanedCurrent &&
      request.status === "pending"
  );
}

function searchUsers(currentUsername, query) {
  const cleanedCurrent = normalizeUsername(currentUsername);
  const q = (query || "").trim().toLowerCase();
  const currentFriends = ensureUserFriendList(cleanedCurrent);

  if (!q) return [];

  return users.filter((user) => {
    const targetUsername = user.username.toLowerCase();

    if (targetUsername === cleanedCurrent) return false;

    const alreadyFriend = currentFriends.some(
      (friend) => friend.username.toLowerCase() === targetUsername
    );

    if (alreadyFriend) return false;

    const pendingRequestExists = friendRequests.some(
      (request) =>
        request.status === "pending" &&
        ((request.fromUsername.toLowerCase() === cleanedCurrent &&
          request.toUsername.toLowerCase() === targetUsername) ||
          (request.toUsername.toLowerCase() === cleanedCurrent &&
            request.fromUsername.toLowerCase() === targetUsername))
    );

    if (pendingRequestExists) return false;

    return user.username.toLowerCase().includes(q);
  });
}

function sendFriendRequest(currentUsername, toUsername) {
  const cleanedCurrent = normalizeUsername(currentUsername);
  const cleanedTarget = normalizeUsername(toUsername);

  if (!cleanedCurrent) {
    return { error: "Current user is required", status: 400 };
  }

  if (!cleanedTarget) {
    return { error: "Username is required", status: 400 };
  }

  if (cleanedCurrent === cleanedTarget) {
    return { error: "You cannot send a request to yourself", status: 400 };
  }

  const user = getUserByUsername(cleanedTarget);

  if (!user) {
    return { error: "User not found", status: 404 };
  }

  const currentFriends = ensureUserFriendList(cleanedCurrent);

  const alreadyFriend = currentFriends.some(
    (friend) => friend.username.toLowerCase() === cleanedTarget
  );

  if (alreadyFriend) {
    return { error: "User is already a friend", status: 409 };
  }

  const existingPendingRequest = friendRequests.some(
    (request) =>
      request.status === "pending" &&
      ((request.fromUsername.toLowerCase() === cleanedCurrent &&
        request.toUsername.toLowerCase() === cleanedTarget) ||
        (request.toUsername.toLowerCase() === cleanedCurrent &&
          request.fromUsername.toLowerCase() === cleanedTarget))
  );

  if (existingPendingRequest) {
    return { error: "A pending request already exists", status: 409 };
  }

  const newRequest = {
    id: Date.now(),
    fromUsername: cleanedCurrent,
    toUsername: user.username,
    status: "pending",
  };

  friendRequests.push(newRequest);

  return { request: newRequest, status: 201 };
}

function acceptFriendRequest(currentUsername, requestId) {
  const cleanedCurrent = normalizeUsername(currentUsername);

  const request = friendRequests.find(
    (r) => r.id === Number(requestId) && r.status === "pending"
  );

  if (!request) {
    return { error: "Friend request not found", status: 404 };
  }

  if (request.toUsername.toLowerCase() !== cleanedCurrent) {
    return { error: "You can only accept incoming requests", status: 403 };
  }

  const fromUser = getUserByUsername(request.fromUsername);
  const toUser = getUserByUsername(request.toUsername);

  if (!fromUser || !toUser) {
    return { error: "One or more users in this request no longer exist", status: 404 };
  }

  const currentFriends = ensureUserFriendList(cleanedCurrent);
  const senderFriends = ensureUserFriendList(fromUser.username);

  const alreadyFriend = currentFriends.some(
    (friend) => friend.username.toLowerCase() === fromUser.username.toLowerCase()
  );

  const newFriendForCurrent = {
    id: fromUser.id,
    username: fromUser.username,
    name: fromUser.name,
    info: "Friends for less than a day",
  };

  const newFriendForSender = {
    id: toUser.id,
    username: toUser.username,
    name: toUser.name,
    info: "Friends for less than a day",
  };

  if (!alreadyFriend) {
    currentFriends.push(newFriendForCurrent);
  }

  const senderAlreadyHasCurrent = senderFriends.some(
    (friend) => friend.username.toLowerCase() === toUser.username.toLowerCase()
  );

  if (!senderAlreadyHasCurrent) {
    senderFriends.push(newFriendForSender);
  }

  friendRequests = friendRequests.filter((r) => r.id !== request.id);

  return {
    friend: newFriendForCurrent,
    status: 200,
  };
}

function declineFriendRequest(currentUsername, requestId) {
  const cleanedCurrent = normalizeUsername(currentUsername);

  const request = friendRequests.find(
    (r) => r.id === Number(requestId) && r.status === "pending"
  );

  if (!request) {
    return { error: "Friend request not found", status: 404 };
  }

  if (request.toUsername.toLowerCase() !== cleanedCurrent) {
    return { error: "You can only decline incoming requests", status: 403 };
  }

  friendRequests = friendRequests.filter((r) => r.id !== request.id);

  return { status: 200 };
}

function removeFriend(currentUsername, usernameToRemove) {
  const cleanedCurrent = normalizeUsername(currentUsername);
  const cleanedTarget = normalizeUsername(usernameToRemove);

  if (!cleanedCurrent) {
    return { error: "Current user is required", status: 400 };
  }

  if (!cleanedTarget) {
    return { error: "Username is required", status: 400 };
  }

  const currentFriends = ensureUserFriendList(cleanedCurrent);
  const targetFriends = ensureUserFriendList(cleanedTarget);

  const existingFriend = currentFriends.find(
    (friend) => friend.username.toLowerCase() === cleanedTarget
  );

  if (!existingFriend) {
    return { error: "Friend not found", status: 404 };
  }

  friendsByUser[cleanedCurrent] = currentFriends.filter(
    (friend) => friend.username.toLowerCase() !== cleanedTarget
  );

  friendsByUser[cleanedTarget] = targetFriends.filter(
    (friend) => friend.username.toLowerCase() !== cleanedCurrent
  );

  return { friend: existingFriend, status: 200 };
}

function resetFriends() {
  users = JSON.parse(JSON.stringify(initialUsers));
  friendsByUser = JSON.parse(JSON.stringify(initialFriendsByUser));
  friendRequests = JSON.parse(JSON.stringify(initialFriendRequests));
}

module.exports = {
  getAllFriends,
  getIncomingRequests,
  getOutgoingRequests,
  searchUsers,
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  removeFriend,
  createInitialFriendStateForUser,
  resetFriends,
};