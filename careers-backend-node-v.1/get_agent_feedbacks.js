const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const database_url = process.env.DATABASE_URI;

mongoose.connect(database_url, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  console.log("Connected to MongoDB successfully.");
  const Feedback = require("./models/FeedbackModel");
  const Path = require("./models/PathModel");
  const Step = require("./models/StepsModel");
  
  const feedbacks = await Feedback.find({}).sort({ createdAt: -1 }).limit(10).lean();
  console.log("\n--- LATEST 10 FEEDBACKS WITH REFERENCES ---");
  for (const f of feedbacks) {
    const p = await Path.findById(f.pathId).select("nameOfPath name").lean();
    const s = await Step.findById(f.stepId).select("name step_order").lean();
    console.log(`Type: ${f.type} | Action: ${f.action} | Comment: "${f.comment}" | Path: "${p ? (p.nameOfPath || p.name) : 'N/A'}" | Step: "${s ? s.name : 'N/A'}" (Order: ${s ? s.step_order : 'N/A'})`);
  }
  
  mongoose.connection.close();
}).catch(err => {
  console.error("MongoDB Connection Error:", err);
});
