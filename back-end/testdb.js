require('dotenv').config();
const mongoose = require('mongoose');

async function test() {
  await mongoose.connect(process.env.MONGODB_URI);

  const collections = await mongoose.connection.db
    .listCollections()
    .toArray();

  console.log("Collections:", collections);

  process.exit();
}

test();