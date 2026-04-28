const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const bcrypt = require("bcrypt");

let mongoServer;

async function seedInMemoryDatabase() {
  const User = require("../models/User");
  const FriendRequest = require("../models/FriendRequest");
  const City = require("../models/City");
  const cityStates = require("../data/cityStates");

  await FriendRequest.deleteMany({});
  await City.deleteMany({});
  await User.deleteMany({});

  const passwordHash = await bcrypt.hash("password123", 10);

  const seedUsers = [
    { username: "alexr", email: "alexr@gmail.com", name: "Alex", password: passwordHash },
    { username: "jordy88", email: "jordy88@gmail.com", name: "Jordan", password: passwordHash },
    { username: "caseybuilds", email: "casey@gmail.com", name: "Casey", password: passwordHash },
    { username: "taylortracks", email: "taylortracks@gmail.com", name: "Taylor", password: passwordHash },
    { username: "morgmoney", email: "morgmoney@gmail.com", name: "Morgan", password: passwordHash },
    { username: "rileybudgets", email: "rileybudgets@gmail.com", name: "Riley", password: passwordHash },
    { username: "jamiecity", email: "jamiecity@gmail.com", name: "Jamie", password: passwordHash },
    { username: "averyplays", email: "averyplays@gmail.com", name: "Avery", password: passwordHash },
    { username: "parkerplans", email: "parkerplans@gmail.com", name: "Parker", password: passwordHash },
    { username: "skylerstacks", email: "skylerstacks@gmail.com", name: "Skyler", password: passwordHash },
  ];

  const createdUsers = {};
  for (const userData of seedUsers) {
    const user = await User.create({
      ...userData,
      friends: [],
    });
    createdUsers[user.username] = user;
  }

  const friendMap = {
    alexr: [
      { username: "jordy88", name: "Jordan", info: "Friends for 3 years" },
      { username: "caseybuilds", name: "Casey", info: "Friends for 8 months" },
    ],
    jordy88: [
      { username: "alexr", name: "Alex", info: "Friends for 3 years" },
    ],
    caseybuilds: [
      { username: "alexr", name: "Alex", info: "Friends for 8 months" },
    ],
  };

  for (const [ownerUsername, friends] of Object.entries(friendMap)) {
    const owner = createdUsers[ownerUsername];
    owner.friends = friends.map((friend) => ({
      user: createdUsers[friend.username]._id,
      username: friend.username,
      name: friend.name,
      info: friend.info,
    }));
    await owner.save();
  }

  await FriendRequest.create({
    fromUser: createdUsers.morgmoney._id,
    toUser: createdUsers.alexr._id,
    status: "pending",
  });

  await FriendRequest.create({
    fromUser: createdUsers.rileybudgets._id,
    toUser: createdUsers.alexr._id,
    status: "pending",
  });

  for (const [username, city] of Object.entries(cityStates)) {
    const user = createdUsers[username];
    if (!user) continue;

    await City.create({
      user: user._id,
      version: city.version,
      buildings: city.buildings,
      decorations: city.decorations,
    });
  }
}

async function connectTestDB() {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
  await seedInMemoryDatabase();
}

async function clearTestDB() {
  const collections = mongoose.connection.collections;

  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({});
  }

  await seedInMemoryDatabase();
}

async function closeTestDB() {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();

  if (mongoServer) {
    await mongoServer.stop();
  }
}

module.exports = {
  connectTestDB,
  clearTestDB,
  closeTestDB,
};