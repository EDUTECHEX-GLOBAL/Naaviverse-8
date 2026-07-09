const mongoose = require("mongoose");

const MarketplaceSchema = new mongoose.Schema(
{
  partner_email: { type: String, required: true },

  path_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "paths",
  },

  step_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "career_steps",
  },

  layer: {
    type: String,
    enum: ["macro","micro","nano"],
    required: true
  },

  role: { type: String },
  category: {
    type: String,
    enum: ["mentor", "vendor", "distributor", "institution", "resource"],
    default: "vendor"
  },
  name: { type: String },

  access: { type: String },
  cost: { type: String },

  goal: { type: String },
  outcomes: { type: String },

  iterations: { type: String },
  duration: { type: String },

  discount: { type: String },
  features: { type: String },

  status: {
    type: String,
    default: "active"
  }

},
{ timestamps:true }
);

module.exports = mongoose.model("marketplace_items", MarketplaceSchema);
