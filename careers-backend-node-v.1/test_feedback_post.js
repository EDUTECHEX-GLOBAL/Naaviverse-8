const mongoose = require("mongoose");
const axios = require("axios");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const database_url = process.env.DATABASE_URI;

mongoose.connect(database_url, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  console.log("Connected to MongoDB");
  const Path = require("./models/PathModel");
  const Step = require("./models/StepsModel");

  // Find a real path and step
  const realPath = await Path.findOne({}).lean();
  const realStep = await Step.findOne({ path_id: realPath._id }).lean();
  
  console.log(`Using Path: ${realPath._id} — "${realPath.nameOfPath || realPath.name}"`);
  console.log(`Using Step: ${realStep._id} — "${realStep.name}" (order: ${realStep.step_order})`);

  // Test posting a comment feedback to the local backend
  try {
    const res = await axios.post("http://localhost:4545/api/feedback", {
      type: "step",
      studentEmail: "aparnaponnuru72@gmail.com",
      pathId: realPath._id.toString(),
      stepId: realStep._id.toString(),
      viewType: "macro",
      action: "comment",
      comment: "this step is not useful for me"
    });
    console.log("\n✅ Backend response:", JSON.stringify(res.data, null, 2));
  } catch (err) {
    console.error("\n❌ Backend error:", err.response ? JSON.stringify(err.response.data, null, 2) : err.message);
  }

  mongoose.connection.close();
}).catch(err => {
  console.error("MongoDB Connection Error:", err);
});
