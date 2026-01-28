const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const AdminUser = require('./models/AdminUser'); // ✅ correct path

async function run() {
  await mongoose.connect(process.env.MONGO_URI);

  console.log("Connected to:", process.env.MONGO_URI);

  const hashed = await bcrypt.hash("naaviadmin@123", 10);

  await AdminUser.deleteMany({ email: "naaviadmin@gmail.com" });

  await AdminUser.create({
    email: "naaviadmin@gmail.com",
    password: hashed
  });

  console.log("✅ Admin created successfully");
  process.exit();
}

run();