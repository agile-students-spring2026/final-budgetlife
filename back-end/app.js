const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
require("dotenv").config();

const friendsRoutes = require("./routes/friends");
const authRoutes = require("./routes/auth");
const budgetRoutes = require("./routes/budget");
const cityStateRoutes = require("./routes/cityStateRoutes");

const app = express();

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({ message: "BudgetLife API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/friends", friendsRoutes);
app.use("/api/budget", budgetRoutes);
app.use("/api/city-state", cityStateRoutes);

module.exports = app;