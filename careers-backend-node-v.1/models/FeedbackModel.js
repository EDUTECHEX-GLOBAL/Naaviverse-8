const mongoose = require("mongoose");

const FeedbackSchema = new mongoose.Schema(
  {
    studentEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["step", "marketplace"],
      required: true,
    },
    pathId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "paths",
      required: true,
    },
    stepId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "career_steps",
      required: true,
    },
    // viewType applies only when type === 'step' (macro, micro, nano)
    viewType: {
      type: String,
      enum: ["macro", "micro", "nano"],
      default: null,
    },
    // providerName & providerType apply only when type === 'marketplace'
    providerName: {
      type: String,
      default: "",
    },
    providerType: {
      type: String,
      default: "",
    },
    action: {
      type: String,
      required: true, // e.g. helpful, notRelevant, comment, skip
    },
    comment: {
      type: String,
      default: "",
    },
    path_source: {
      type: String,
      enum: ["AI", "PARTNER"],
      default: "AI",
    },
    owner_id: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "synced", "failed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Feedback", FeedbackSchema);
