const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
require("dotenv").config();

const friendsRoutes = require("./routes/friends");

const app = express();

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({ message: "BudgetLife API is running" });
});

app.use("/api/friends", friendsRoutes);

module.exports = app;