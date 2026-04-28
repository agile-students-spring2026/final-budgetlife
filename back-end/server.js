#!/usr/bin/env node

require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/db");

const port = process.env.PORT || 3000;

let listener;

async function startServer() {
  try {
    await connectDB();

    listener = app.listen(port, () => {
      console.log(`Server running on port: ${port}`);
    });
  } catch (err) {
    console.error("Mongo connection failed:", err);
    process.exit(1);
  }
}

startServer();

const close = () => {
  if (listener) {
    listener.close();
  }
};

module.exports = { close };