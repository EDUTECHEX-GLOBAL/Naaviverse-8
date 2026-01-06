const mongoose = require('mongoose');
const bcrypt = require("bcrypt");

const partnerSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  username: { type: String },
  password: { type: String, required: true },
  userType: { type: String },
  OTP: { type: String },
  OTPCreatedTime: { type: Date },
  OTPAttempts: { type: Number, default: 0 },
  isBlocked: { type: Boolean, default: false },
  OTPverified: { type: Boolean, default: false },
  status: { type: Boolean, default: false },

  firstName: { type: String },
  lastName: { type: String },
  businessName: { type: String },
  logo: { type: String },
  street: { type: String },
  city: { type: String },
  state: { type: String },
  pincode: { type: String },
  country: { type: String },
  description: { type: String },
  website: { type: String },

  // ❌ OLD generic field: type
  // type: { type: String },

  // ✅ NEW correct field: partner category
  partnerType: {
    type: String,
    enum: ["Distributor", "Vendor", "Mentor", "Institution"],
    required: true
  },

  yourPosition: { type: String }
}, {
  timestamps: true
});

// Hash password before save
partnerSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Normalize email
partnerSchema.pre("save", function (next) {
  if (this.email) {
    this.email = this.email.toLowerCase();
  }
  next();
});

// Check if OTP is expired
partnerSchema.methods.isOTPExpired = function () {
  if (!this.OTPCreatedTime) return true;
  const diff = Date.now() - this.OTPCreatedTime.getTime();
  return diff > 5 * 60 * 1000; // 5 minutes
};

// Password match
partnerSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('naavi_partners', partnerSchema);
