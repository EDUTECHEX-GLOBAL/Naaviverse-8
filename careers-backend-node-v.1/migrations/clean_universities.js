require("dotenv").config();
const mongoose = require("mongoose");
const Universities = require("../models/UniversitiesModel");

(async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URI);
    console.log("[OK] Connected to MongoDB");

    const names = await Universities.find().select("name -_id").lean();

    console.log(`Found ${names.length} universities`);

    await Universities.deleteMany({});
    console.log("[DEL] Old data deleted");

    await Universities.insertMany(names);
    console.log("[HOT] Reinserted clean name-only documents");

    process.exit(0);

  } catch (error) {
    console.error("[ERROR] Error:", error);
    process.exit(1);
  }
})();