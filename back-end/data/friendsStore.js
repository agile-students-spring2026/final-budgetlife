const initialFriends = [
  { id: 1, username: "alexr", name: "Alex", info: "Friend" },
  { id: 2, username: "jordy88", name: "Jordan", info: "Friend" },
];

const users = [
  { id: 1, username: "alexr", name: "Alex" },
  { id: 2, username: "jordy88", name: "Jordan" },
  { id: 3, username: "caseybuilds", name: "Casey" },
  { id: 4, username: "taylortracks", name: "Taylor" },
  { id: 5, username: "morganmoney", name: "Morgan" },
  { id: 6, username: "rileybudgets", name: "Riley" },
  { id: 7, username: "jamiecity", name: "Jamie" },
  { id: 8, username: "averyplays", name: "Avery" },
  { id: 9, username: "parkerplans", name: "Parker" },
  { id: 10, username: "skylerstacks", name: "Skyler" },
  { id: 11, username: "quinncoins", name: "Quinn" },
  { id: 12, username: "drewdaily", name: "Drew" },
  { id: 13, username: "harperhub", name: "Harper" },
  { id: 14, username: "loganledger", name: "Logan" },
  { id: 15, username: "blakebanks", name: "Blake" },
  { id: 16, username: "devonvault", name: "Devon" },
  { id: 17, username: "rowanbudget", name: "Rowan" },
  { id: 18, username: "finleyfunds", name: "Finley" },
];

let friends = [...initialFriends];

function getAllFriends() {
  return friends;
}

function searchUsers(query) {
  const q = (query || "").trim().toLowerCase();

  return users.filter((user) => {
    const alreadyFriend = friends.some(
      (friend) => friend.username.toLowerCase() === user.username.toLowerCase()
    );

    if (alreadyFriend) return false;

    if (!q) return true;

    return user.username.toLowerCase().includes(q);
  });
}

function addFriend(username) {
  const cleanedUsername = (username || "").trim();

  if (!cleanedUsername) {
    return { error: "Username is required", status: 400 };
  }

  const user = users.find(
    (u) => u.username.toLowerCase() === cleanedUsername.toLowerCase()
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

  const newFriend = {
    id: user.id,
    username: user.username,
    name: user.name,
    info: "Friend",
  };

  friends.push(newFriend);

  return { friend: newFriend, status: 201 };
}

function removeFriend(username) {
  const cleanedUsername = (username || "").trim();

  if (!cleanedUsername) {
    return { error: "Username is required", status: 400 };
  }

  const existingFriend = friends.find(
    (friend) => friend.username.toLowerCase() === cleanedUsername.toLowerCase()
  );

  if (!existingFriend) {
    return { error: "Friend not found", status: 404 };
  }

  friends = friends.filter(
    (friend) => friend.username.toLowerCase() !== cleanedUsername.toLowerCase()
  );

  return { friend: existingFriend, status: 200 };
}

function resetFriends() {
  friends = [...initialFriends];
}

module.exports = {
  getAllFriends,
  searchUsers,
  addFriend,
  removeFriend,
  resetFriends,
};