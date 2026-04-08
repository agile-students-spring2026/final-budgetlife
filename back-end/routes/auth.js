const express = require("express");
const router = express.Router();
const { signupUser, loginUser } = require("../data/usersStore");

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

module.exports = router;