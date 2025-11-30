const mongoose = require("mongoose");

const StepViewsSchema = new mongoose.Schema({
  universityId: { type: mongoose.Schema.Types.ObjectId, ref: "Universities", required: true },

  // ❌ Change from ObjectId → String
  stepId: { type: String, required: true },

  macroView: String,

  microView: {
    grade: String,
    stream: String,
    curriculum: String,
    gpa: String,
    financialPosition: String,
    personality: String,
  },

  nanoView: [String],

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("StepViews", StepViewsSchema);
