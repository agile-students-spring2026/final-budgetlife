const initialFriends = [
  { id: 1, username: "alexr", name: "Alex", info: "Friends for 3 years" },
  { id: 2, username: "jordy88", name: "Jordan", info: "Friends for 7 months" },
];

const users = [
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

let friends = [...initialFriends];

let friendRequests = [
  {
    id: 1,
    fromUsername: "caseybuilds",
    toUsername: "alexr",
    status: "pending",
  },
  {
    id: 2,
    fromUsername: "morgmoney",
    toUsername: "alexr",
    status: "pending",
  },
  {
    id: 6,
    fromUsername: "rileybudgets",
    toUsername: "alexr",
    status: "pending",
  },
];

const CURRENT_USER = "alexr";

function getAllFriends() {
  return friends;
}

function getIncomingRequests() {
  return friendRequests.filter(
    (request) =>
      request.toUsername.toLowerCase() === CURRENT_USER.toLowerCase() &&
      request.status === "pending"
  );
}

function getOutgoingRequests() {
  return friendRequests.filter(
    (request) =>
      request.fromUsername.toLowerCase() === CURRENT_USER.toLowerCase() &&
      request.status === "pending"
  );
}

function searchUsers(query) {
  const q = (query || "").trim().toLowerCase();

  return users.filter((user) => {
    if (user.username.toLowerCase() === CURRENT_USER.toLowerCase()) return false;

    const alreadyFriend = friends.some(
      (friend) => friend.username.toLowerCase() === user.username.toLowerCase()
    );

    if (alreadyFriend) return false;

    const pendingRequestExists = friendRequests.some(
      (request) =>
        request.status === "pending" &&
        ((request.fromUsername.toLowerCase() === CURRENT_USER.toLowerCase() &&
          request.toUsername.toLowerCase() === user.username.toLowerCase()) ||
          (request.toUsername.toLowerCase() === CURRENT_USER.toLowerCase() &&
            request.fromUsername.toLowerCase() === user.username.toLowerCase()))
    );

    if (pendingRequestExists) return false;

    if (!q) return true;

    return user.username.toLowerCase().includes(q);
  });
}

function sendFriendRequest(toUsername) {
  const cleaned = (toUsername || "").trim();

  if (!cleaned) {
    return { error: "Username is required", status: 400 };
  }

  if (cleaned.toLowerCase() === CURRENT_USER.toLowerCase()) {
    return { error: "You cannot send a request to yourself", status: 400 };
  }

  const user = users.find(
    (u) => u.username.toLowerCase() === cleaned.toLowerCase()
  );

  if (!user) {
    return { error: "User not found", status: 404 };
  }

  const alreadyFriend = friends.some(
    (friend) => friend.username.toLowerCase() === user.username.toLowerCase()
  );

  if (alreadyFriend) {
    return { error: "User is already a friend", status: 409 };
  }

  const existingPendingRequest = friendRequests.some(
    (request) =>
      request.status === "pending" &&
      ((request.fromUsername.toLowerCase() === CURRENT_USER.toLowerCase() &&
        request.toUsername.toLowerCase() === user.username.toLowerCase()) ||
        (request.toUsername.toLowerCase() === CURRENT_USER.toLowerCase() &&
          request.fromUsername.toLowerCase() === user.username.toLowerCase()))
  );

  if (existingPendingRequest) {
    return { error: "A pending request already exists", status: 409 };
  }

  const newRequest = {
    id: Date.now(),
    fromUsername: CURRENT_USER,
    toUsername: user.username,
    status: "pending",
  };

  friendRequests.push(newRequest);

  return { request: newRequest, status: 201 };
}

function acceptFriendRequest(requestId) {
  const request = friendRequests.find(
    (r) => r.id === Number(requestId) && r.status === "pending"
  );

  if (!request) {
    return { error: "Friend request not found", status: 404 };
  }

  if (request.toUsername.toLowerCase() !== CURRENT_USER.toLowerCase()) {
    return { error: "You can only accept incoming requests", status: 403 };
  }

  const user = users.find(
    (u) => u.username.toLowerCase() === request.fromUsername.toLowerCase()
  );

  if (!user) {
    return { error: "Request sender not found", status: 404 };
  }

  const alreadyFriend = friends.some(
    (friend) => friend.username.toLowerCase() === user.username.toLowerCase()
  );

  if (!alreadyFriend) {
    friends.push({
      id: user.id,
      username: user.username,
      name: user.name,
      info: "Friends for less than a day",
    });
  }

  friendRequests = friendRequests.filter((r) => r.id !== request.id);

  return {
    friend: {
      id: user.id,
      username: user.username,
      name: user.name,
      info: "Friends for less than a day",
    },
    status: 200,
  };
}

function declineFriendRequest(requestId) {
  const request = friendRequests.find(
    (r) => r.id === Number(requestId) && r.status === "pending"
  );

  if (!request) {
    return { error: "Friend request not found", status: 404 };
  }

  if (request.toUsername.toLowerCase() !== CURRENT_USER.toLowerCase()) {
    return { error: "You can only decline incoming requests", status: 403 };
  }

  friendRequests = friendRequests.filter((r) => r.id !== request.id);

  return { status: 200 };
}

function removeFriend(username) {
  const cleaned = (username || "").trim();

  if (!cleaned) {
    return { error: "Username is required", status: 400 };
  }

  const existingFriend = friends.find(
    (friend) => friend.username.toLowerCase() === cleaned.toLowerCase()
  );

  if (!existingFriend) {
    return { error: "Friend not found", status: 404 };
  }

  friends = friends.filter(
    (friend) => friend.username.toLowerCase() !== cleaned.toLowerCase()
  );

  return { friend: existingFriend, status: 200 };
}

function resetFriends() {
  friends = [...initialFriends];
  friendRequests = [
    {
      id: 1,
      fromUsername: "caseybuilds",
      toUsername: "alexr",
      status: "pending",
    },
    {
      id: 2,
      fromUsername: "morganmoney",
      toUsername: "alexr",
      status: "pending",
    },
  ];
}

module.exports = {
  CURRENT_USER,
  getAllFriends,
  getIncomingRequests,
  getOutgoingRequests,
  searchUsers,
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  removeFriend,
  resetFriends,
};