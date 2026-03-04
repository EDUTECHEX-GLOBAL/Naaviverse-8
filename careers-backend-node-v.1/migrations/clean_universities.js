require("dotenv").config();
const mongoose = require("mongoose");
const Universities = require("../models/universities.model");

(async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URI);
    console.log("✅ Connected to MongoDB");

    const names = await Universities.find().select("name -_id").lean();

    console.log(`Found ${names.length} universities`);

    await Universities.deleteMany({});
    console.log("🗑 Old data deleted");

    await Universities.insertMany(names);
    console.log("🔥 Reinserted clean name-only documents");

    process.exit(0);

  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
})();