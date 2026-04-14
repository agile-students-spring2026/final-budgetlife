#!/usr/bin/env node

const app = require("./app");

const port = process.env.PORT || 3000;


const listener = app.listen(port, () => {
  console.log(`Server running on port: ${port}`);
});

const close = () => {
  listener.close();
};

module.exports = { close };