// models/Activity.model.js
// ─────────────────────────────────────────────────────────────────────────────
// UNIFIED activity model — one collection for BOTH users and partners.
//
// Collection name : naavi_activity
//
// role = "user"    → events: login | explore | path | market | step
// role = "partner" → events: login | publish | listing | approval | invite | message
// ─────────────────────────────────────────────────────────────────────────────

const mongoose = require("mongoose");

// ── Single event subdocument ─────────────────────────────────────────────────
const activityEventSchema = new mongoose.Schema(
  {
    // user events    : login | explore | path | market | step
    // partner events : login | publish | listing | approval | invite | message
    type:      { type: String, required: true },
    title:     { type: String, required: true },
    desc:      { type: String, default: "" },
    chipLabel: { type: String, default: "" },
    chipClass: { type: String, default: "activity-chip-login" },

    // ── Path / step detail (user events only) ──────────────────────────────
    pathId:    { type: mongoose.Schema.Types.ObjectId, ref: "paths",        default: null },
    stepId:    { type: mongoose.Schema.Types.ObjectId, ref: "career_steps", default: null },
    pathName:  { type: String, default: "" },
    stepName:  { type: String, default: "" },
    microStep: { type: String, default: "" },

    // ── Market detail (user events only) ───────────────────────────────────
    itemName: { type: String, default: "" },
    itemCost: { type: String, default: "" },

    // ── Step completion status ──────────────────────────────────────────────
    status: {
      type:    String,
      enum:    ["completed", "in_progress", "viewed"],
      default: "completed",
    },
  },
  { timestamps: true } // createdAt = exact moment the event was recorded
);

// ── Main activity document — one doc per actor (user or partner) ─────────────
const activitySchema = new mongoose.Schema(
  {
    // ── Role discriminator ────────────────────────────────────────────────
    role: {
      type:     String,
      enum:     ["user", "partner"],
      required: true,
    },

    // ── Shared identity fields ────────────────────────────────────────────
    actorEmail: {
      type:      String,
      required:  true,
      unique:    true,
      lowercase: true,
      trim:      true,
    },

    // users    → ref to naavi_users
    // partners → ref to naavi_partners
    actorId: {
      type:    mongoose.Schema.Types.ObjectId,
      default: null,
    },

    // ── Display fields ────────────────────────────────────────────────────
    // users   : full name      (e.g. "Riya Sharma")
    // partners: business name  (e.g. "SkillBridge Inc")
    displayName: { type: String, default: "" },
    initials:    { type: String, default: "" },

    // ── Partner-only display fields (empty string for users) ──────────────
    partnerType: { type: String, default: "" }, // Institution | Mentor | Vendor | Distributor

    // ── Timestamps ────────────────────────────────────────────────────────
    joinedAt:    { type: Date, default: Date.now },
    lastEventAt: { type: Date, default: null },

    // ── Rolling event log — latest 50 kept ───────────────────────────────
    events: { type: [activityEventSchema], default: [] },
  },
  { timestamps: true }
);

// ─────────────────────────────────────────────────────────────────────────────
// Virtual: status  — applies to BOTH users and partners
//
//   active  → last event < 1 hour ago
//   idle    → last event between 1 hour and 10 days ago
//   offline → last event 10+ days ago  OR  never logged any event
//
//   Login just now           → active
//   No activity for 4-5 days → idle
//   No activity for 10+ days → offline
// ─────────────────────────────────────────────────────────────────────────────
// REPLACE this entire virtual:
activitySchema.virtual("status").get(function () {
  if (!this.lastEventAt) return "offline";

  const diffMin = (Date.now() - new Date(this.lastEventAt).getTime()) / 60000;

  if (diffMin < 1440)         return "active";  // < 24 hours
  if (diffMin < 60 * 24 * 10) return "idle";    // 24 hours → 10 days
  return "offline";                             // 10+ days
});

// ─────────────────────────────────────────────────────────────────────────────
// Virtual: joinedDays — human readable join duration
// ─────────────────────────────────────────────────────────────────────────────
activitySchema.virtual("joinedDays").get(function () {
  const diffDays = Math.floor(
    (Date.now() - new Date(this.joinedAt).getTime()) / 86400000
  );
  if (diffDays === 0)  return "today";
  if (diffDays === 1)  return "1 day ago";
  if (diffDays < 7)   return `${diffDays} days ago`;
  if (diffDays < 30)  return `${Math.floor(diffDays / 7)} week(s) ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} month(s) ago`;
  return `${Math.floor(diffDays / 365)} year(s) ago`;
});

activitySchema.set("toJSON",   { virtuals: true });
activitySchema.set("toObject", { virtuals: true });

// ── Indexes ───────────────────────────────────────────────────────────────────
activitySchema.index({ role: 1, lastEventAt: -1 });
activitySchema.index({ actorEmail: 1 });

module.exports = mongoose.model("naavi_activity", activitySchema);