const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

let memoryServerPromise;

async function resolveMongoUri() {
  if (process.env.MONGODB_URI) {
    return process.env.MONGODB_URI;
  }

  if (!memoryServerPromise) {
    memoryServerPromise = MongoMemoryServer.create();
  }

  const memoryServer = await memoryServerPromise;
  console.warn("MONGODB_URI is not set; using in-memory MongoDB for local testing.");
  return memoryServer.getUri();
}

async function connectDB() {
  const uri = await resolveMongoUri();

  await mongoose.connect(uri);
  console.log("MongoDB connected");
}

module.exports = connectDB;