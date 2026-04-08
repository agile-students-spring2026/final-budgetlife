const { createInitialFriendStateForUser } = require("./friendsStore");

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
    (user) => user.username.toLowerCase() === (username || "").trim().toLowerCase()
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

function resetUsers() {
  users = [...initialUsers];
}

module.exports = {
  getAllUsers,
  findUserByUsername,
  findUserByEmail,
  signupUser,
  loginUser,
  resetUsers,
};