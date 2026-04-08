const express = require("express");
const router = express.Router();

const {
  signupUser,
  loginUser,
  updateUsername,
  updateEmail,
  changePassword,
  deleteUser,
} = require("../data/usersStore");

router.post("/signup", (req, res) => {
  const result = signupUser(req.body);

  if (result.error) {
    return res.status(result.status).json({ error: result.error });
  }

  res.status(result.status).json({
    message: "Signup successful",
    user: result.user,
  });
});

router.post("/login", (req, res) => {
  const result = loginUser(req.body);

  if (result.error) {
    return res.status(result.status).json({ error: result.error });
  }

  res.status(result.status).json({
    message: "Login successful",
    user: result.user,
  });
});

router.patch("/username", (req, res) => {
  const { currentUsername, newUsername } = req.body;
  const result = updateUsername(currentUsername, newUsername);

  if (result.error) {
    return res.status(result.status).json({ error: result.error });
  }

  res.status(result.status).json({
    message: "Username updated",
    user: result.user,
  });
});

router.patch("/email", (req, res) => {
  const { currentUsername, newEmail } = req.body;
  const result = updateEmail(currentUsername, newEmail);

  if (result.error) {
    return res.status(result.status).json({ error: result.error });
  }

  res.status(result.status).json({
    message: "Email updated",
    user: result.user,
  });
});

router.patch("/password", (req, res) => {
  const { currentUsername, oldPassword, newPassword } = req.body;
  const result = changePassword(currentUsername, oldPassword, newPassword);

  if (result.error) {
    return res.status(result.status).json({ error: result.error });
  }

  res.status(result.status).json({
    message: "Password updated",
  });
});

router.delete("/account", (req, res) => {
  const { currentUsername } = req.body;
  const result = deleteUser(currentUsername);

  if (result.error) {
    return res.status(result.status).json({ error: result.error });
  }

  res.status(result.status).json({
    message: "Account deleted",
  });
});

module.exports = router;