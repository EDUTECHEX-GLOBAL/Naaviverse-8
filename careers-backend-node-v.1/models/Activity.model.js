const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "naavi_users",
      required: true,
    },
    email: { type: String, required: true },

    type: {
      type: String,
      enum: ["login", "explore", "path", "market", "step"],
      required: true,
    },

    // For path/step events
    pathId:   { type: mongoose.Schema.Types.ObjectId, ref: "paths", default: null },
    pathName: { type: String, default: "" },

    stepId:   { type: mongoose.Schema.Types.ObjectId, ref: "career_steps", default: null },
    stepName: { type: String, default: "" },

    microStep: { type: String, default: "" },  // micro / macro / nano action label

    // Generic title + description shown in timeline
    title: { type: String, default: "" },
    desc:  { type: String, default: "" },

    // For market events
    itemName:  { type: String, default: "" },
    itemCost:  { type: String, default: "" },

    status: {
      type: String,
      enum: ["completed", "in_progress", "viewed"],
      default: "completed",
    },
  },
  { timestamps: true }
);

// Index for fast user-based queries
activitySchema.index({ userId: 1, createdAt: -1 });
activitySchema.index({ email: 1,  createdAt: -1 });

module.exports = mongoose.model("naavi_activity", activitySchema);