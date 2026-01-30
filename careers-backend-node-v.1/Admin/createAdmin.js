const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '../.env' });

const AdminUser = require('./models/AdminUser');

async function run() {
  console.log('DB URI:', process.env.DATABASE_URI);

  await mongoose.connect(process.env.DATABASE_URI);

  const hashed = await bcrypt.hash("naaviadmin@123", 10);

  await AdminUser.deleteMany({ email: "info@naavinetwork.ai" });

  await AdminUser.create({
    email: "info@naavinetwork.ai",
    password: hashed
  });

  console.log("✅ Admin created successfully");
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
