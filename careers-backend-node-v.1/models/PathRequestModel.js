const mongoose = require("mongoose");

const PathRequestSchema = new mongoose.Schema(
  {
    requestId: {
      type: String,
      unique: true,
      index: true,
    },
    userId: {
      type: String,
      default: null,
    },
    userEmail: {
      type: String,
      required: true,
      index: true,
      trim: true,
      lowercase: true,
    },
    userName: {
      type: String,
      default: "Student",
      trim: true,
    },

    // ── Primary Goal & Institution ──
    targetGoal: {
      type: String,
      required: true,
      trim: true,
    },
    targetInstitution: {
      type: String,
      default: "",
      trim: true,
    },

    // ── Domain & Academics ──
    sector: {
      type: String,
      required: true,
      default: "Higher Education",
      trim: true,
    },
    educationLevel: {
      type: String,
      default: "Undergraduate",
      trim: true,
    },
    targetTimeline: {
      type: String,
      default: "4 Years",
      trim: true,
    },

    // ── Detailed Requirements ──
    goalDetails: {
      type: String,
      default: "",
    },
    mandatoryRequirements: {
      type: String,
      default: "",
    },
    specialInstructions: {
      type: String,
      default: "",
    },

    // ── Lifecycle Status ──
    status: {
      type: String,
      enum: ["pending", "in_progress", "created", "rejected"],
      default: "pending",
      index: true,
    },

    // ── Super Admin Fulfillment ──
    adminNotes: {
      type: String,
      default: "",
    },
    createdPathId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "paths",
      default: null,
    },
    createdPathName: {
      type: String,
      default: "",
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to generate human-readable requestId if not provided
PathRequestSchema.pre("save", function (next) {
  if (!this.requestId) {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const datePrefix = new Date().toISOString().slice(2, 7).replace("-", "");
    this.requestId = `PR-${datePrefix}-${randomSuffix}`;
  }
  next();
});

module.exports = mongoose.model("path_requests", PathRequestSchema);
