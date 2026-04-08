const {
  createInitialFriendStateForUser,
  renameUserInFriendsData,
  deleteUserFromFriendsData,
} = require("./friendsStore");

const initialUsers = [
  {
    id: 1,
    username: "alexr",
    email: "alexr@gmail.com",
    password: "password123",
  },
  {
    id: 2,
    username: "jordy88",
    email: "jordy88@gmail.com",
    password: "password123",
  },
  {
    id: 3,
    username: "caseybuilds",
    email: "casey@gmail.com",
    password: "password123",
  },
];

let users = [...initialUsers];

function getAllUsers() {
  return users;
}

function findUserByUsername(username) {
  return users.find(
    (user) =>
      user.username.toLowerCase() === (username || "").trim().toLowerCase()
  );
}

function findUserByEmail(email) {
  return users.find(
    (user) => user.email.toLowerCase() === (email || "").trim().toLowerCase()
  );
}

function signupUser({ username, email, password }) {
  const cleanedUsername = (username || "").trim();
  const cleanedEmail = (email || "").trim().toLowerCase();
  const cleanedPassword = (password || "").trim();

  if (!cleanedUsername || !cleanedEmail || !cleanedPassword) {
    return { error: "Username, email, and password are required", status: 400 };
  }

  if (findUserByUsername(cleanedUsername)) {
    return { error: "Username already exists", status: 409 };
  }

  if (findUserByEmail(cleanedEmail)) {
    return { error: "Email already exists", status: 409 };
  }

  const newUser = {
    id: Date.now(),
    username: cleanedUsername,
    email: cleanedEmail,
    password: cleanedPassword,
  };

  users.push(newUser);

  createInitialFriendStateForUser({
    id: newUser.id,
    username: newUser.username,
    name: newUser.username,
  });

  return {
    user: {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
    },
    status: 201,
  };
}

function loginUser({ usernameOrEmail, password }) {
  const cleanedLogin = (usernameOrEmail || "").trim().toLowerCase();
  const cleanedPassword = (password || "").trim();

  if (!cleanedLogin || !cleanedPassword) {
    return { error: "Username/email and password are required", status: 400 };
  }

  const user = users.find(
    (u) =>
      u.username.toLowerCase() === cleanedLogin ||
      u.email.toLowerCase() === cleanedLogin
  );

  if (!user || user.password !== cleanedPassword) {
    return { error: "Invalid login credentials", status: 401 };
  }

  return {
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
    },
    status: 200,
  };
}

function updateUsername(currentUsername, newUsername) {
  const cleanedCurrent = (currentUsername || "").trim().toLowerCase();
  const cleanedNew = (newUsername || "").trim();

  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;

  if (!cleanedCurrent || !cleanedNew) {
    return { error: "Enter a valid username", status: 400 };
  }

  if (!usernameRegex.test(cleanedNew)) {
    return { error: "Enter a valid username", status: 400 };
  }

  const user = findUserByUsername(cleanedCurrent);

  if (!user) {
    return { error: "User not found", status: 404 };
  }

  const existing = findUserByUsername(cleanedNew);

  if (existing && existing.username.toLowerCase() !== cleanedCurrent) {
    return { error: "Username already exists", status: 409 };
  }

  const oldUsername = user.username;
  user.username = cleanedNew;

  renameUserInFriendsData(oldUsername, cleanedNew);

  return {
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
    },
    status: 200,
  };
}

function updateEmail(currentUsername, newEmail) {
  const cleanedCurrent = (currentUsername || "").trim().toLowerCase();
  const cleanedEmail = (newEmail || "").trim().toLowerCase();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!cleanedCurrent || !cleanedEmail) {
    return { error: "Enter a valid email", status: 400 };
  }

  if (!emailRegex.test(cleanedEmail)) {
    return { error: "Enter a valid email", status: 400 };
  }

  const user = findUserByUsername(cleanedCurrent);

  if (!user) {
    return { error: "User not found", status: 404 };
  }

  const existing = findUserByEmail(cleanedEmail);

  if (existing && existing.username.toLowerCase() !== cleanedCurrent) {
    return { error: "Email already exists", status: 409 };
  }

  user.email = cleanedEmail;

  return {
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
    },
    status: 200,
  };
}

function changePassword(currentUsername, oldPassword, newPassword) {
  const cleanedCurrent = (currentUsername || "").trim().toLowerCase();
  const cleanedOld = (oldPassword || "").trim();
  const cleanedNew = (newPassword || "").trim();

  if (!cleanedCurrent || !cleanedOld || !cleanedNew) {
    return { error: "All password fields are required", status: 400 };
  }

  const user = findUserByUsername(cleanedCurrent);

  if (!user) {
    return { error: "User not found", status: 404 };
  }

  if (user.password !== cleanedOld) {
    return { error: "Old password is incorrect", status: 401 };
  }

  user.password = cleanedNew;

  return { status: 200 };
}

function deleteUser(currentUsername) {
  const cleanedCurrent = (currentUsername || "").trim().toLowerCase();

  const user = findUserByUsername(cleanedCurrent);

  if (!user) {
    return { error: "User not found", status: 404 };
  }

  users = users.filter(
    (existingUser) => existingUser.username.toLowerCase() !== cleanedCurrent
  );

  deleteUserFromFriendsData(cleanedCurrent);

  return { status: 200 };
}

function resetUsers() {
  users = [...initialUsers];
}

module.exports = {
  getAllUsers,
  findUserByUsername,
  findUserByEmail,
  signupUser,
  loginUser,
  updateUsername,
  updateEmail,
  changePassword,
  deleteUser,
  resetUsers,
};