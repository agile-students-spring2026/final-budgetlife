const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const friendsRouter = require("./routes/friends");

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "BudgetLife backend is running" });
});

app.use("/api/friends", friendsRouter);

module.exports = app;