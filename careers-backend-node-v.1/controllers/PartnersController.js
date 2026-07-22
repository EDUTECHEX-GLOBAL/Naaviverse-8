// controllers/partners.controller.js
// ─────────────────────────────────────────────────────────────────────────────
// All partner auth + profile logic.
// Activity logging now uses the UNIFIED logEvent from Activity.controller.js
// — no more dependency on partneractivity.controller.js (that file is deleted)
// ─────────────────────────────────────────────────────────────────────────────

const mongoose = require("mongoose");
const Partner  = require("../models/PartnerModel");
const Approval = require("../models/ApprovalModel");
require("dotenv").config({ path: ".env" });
const jwt    = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const { generateOTP, sendNotificationMail } = require("../middlewares/verifySignUp");

// ✅ Unified activity — replaces the old partneractivity.controller import
const { logEvent } = require("./ActivityController");


// ─────────────────────────────────────────────────────────────────────────────
// SIGN UP
// ─────────────────────────────────────────────────────────────────────────────
const signUp = async (req, res) => {
  try {
    const { email, username, password, partnerType } = req.body;

    if (!email || !username || !password || !partnerType) {
      return res.status(400).json({
        success: false,
        message: "Email, username, password and partnerType are required",
      });
    }

    const existingPartner = await Partner.findOne({ email });
    if (existingPartner) {
      return res.status(400).json({ success: false, message: "User is already registered" });
    }

    const OTP         = generateOTP();
    const currentTime = new Date();

    const temporalPartner = new Partner({
      username, email, password, partnerType,
      OTP, isBlocked: false, OTPAttempts: 0,
      OTPverified: false, OTPCreatedTime: currentTime, status: false,
    });

    await temporalPartner.save();
    console.log("✅ Partner saved. OTP:", OTP);

    // Auto-generate unique partnerId
    const prefix = "NVP";
    const cleanUser = (username || email).replace(/[^a-zA-Z0-9]/g, "");
    const code = cleanUser.slice(0, 3).toUpperCase();
    const year = new Date().getFullYear();
    const shortId = temporalPartner._id.toString().slice(-6).toUpperCase();
    const partnerId = `${prefix}-${code}-${year}-${shortId}`;

    temporalPartner.partnerId = partnerId;
    await temporalPartner.save();
    console.log("✅ Partner unique partnerId generated:", partnerId);

    sendNotificationMail(
      email,
      "Naavi Registration Confirmation OTP",
      `Dear Partner,<br>Your OTP: ${OTP}<br>`
    );

    const token = jwt.sign({ id: temporalPartner._id }, process.env.JWT_SECRET_KEY, { expiresIn: "1d" });

    return res.status(201).json({
      success: true,
      message: "Partner created successfully",
      token,
      partner: {
        id:          temporalPartner._id,
        partnerId:   temporalPartner.partnerId,
        username:    temporalPartner.username,
        email:       temporalPartner.email,
        partnerType: temporalPartner.partnerType,
      },
    });
  } catch (error) {
    console.error("SignUp Error:", error);
    return res.status(500).json({ success: false, message: "Something went wrong", error: error.message });
  }
};


// ─────────────────────────────────────────────────────────────────────────────
// LOGIN — logs "login" event to unified activity collection
// ─────────────────────────────────────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Both email and password are required" });
    }

    const partner = await Partner.findOne({ email });
    if (!partner) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await partner.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid password" });
    }

    const approval       = await Approval.findOne({ email: partner.email });
    const profileCreated = !!approval;
    const approvalStatus = approval ? approval.status : "not_submitted";

    const token = jwt.sign({ id: partner._id }, process.env.JWT_SECRET_KEY, { expiresIn: "1d" });

    // ✅ Fire-and-forget activity log — never blocks the login response
   // ✅ Correct (non-blocking with error handling)
await logEvent({
  role:        "partner",
  email:       partner.email,
  displayName: partner.businessName || partner.username || email,
  partnerType: partner.partnerType  || "",
  eventType:   "login",
  title:       "Partner Logged In",
  desc:        `${partner.businessName || partner.username || email} signed in to the portal`,
}).catch(err => console.error("Partner login activity log error:", err));

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      partner: {
        id:             partner._id,
        username:       partner.username,
        email:          partner.email,
        partnerType:    partner.partnerType,
        profileCreated,
        status:         approvalStatus,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};


// ─────────────────────────────────────────────────────────────────────────────
// FORGOT PASSWORD
// ─────────────────────────────────────────────────────────────────────────────
const forgotPassword = async (req, res) => {
  let partnerFound;
  if (typeof req.body.email !== "undefined")
    partnerFound = await Partner.findOne({ email: req.body.email });

  if (!partnerFound) return res.status(400).json({ message: "User Not Found" });

  const OTP         = generateOTP();
  const currentTime = new Date();
  partnerFound.OTP            = OTP;
  partnerFound.OTPCreatedTime = currentTime;
  await partnerFound.save();

  sendNotificationMail(req.body.email, "Naavi forgot password OTP", `Dear Partner,<br>Your OTP: ${OTP}<br>`);

  const token = jwt.sign({ id: partnerFound._id }, process.env.JWT_SECRET_KEY, { expiresIn: 86400 });
  return res.status(200).json({ success: true, token, message: "OTP sent to your emailId" });
};


// ─────────────────────────────────────────────────────────────────────────────
// SEND CONFIRMATION EMAIL
// ─────────────────────────────────────────────────────────────────────────────
const sendConfirmationEmail = async (req, res) => {
  try {
    const partnerFound = await Partner.findOne({ email: req.body.email });
    const token        = partnerFound.emailToken;
    const url          = `${process.env.HOST || "localhost:7000"}/api/auth/verification/${token}`;
    await sendConfirmationEmailFunction(url, partnerFound.email);
    return res.status(200).json({ success: true, message: "Confirmation email sent" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};


// ─────────────────────────────────────────────────────────────────────────────
// LOGOUT
// ─────────────────────────────────────────────────────────────────────────────
const logout = async (req, res) => {
  try {
    res.clearCookie("delivery-app-session-token");
    return res.status(200).json({ successful: true, message: "Partner logged out successfully" });
  } catch (error) {
    return res.status(500).json({ message: error });
  }
};


// ─────────────────────────────────────────────────────────────────────────────
// SEND RESET PASSWORD EMAIL
// ─────────────────────────────────────────────────────────────────────────────
const sendResetPasswordEmail = async (req, res) => {
  try {
    const partnerFound = await Partner.findOne({ email: req.body.email });
    if (!partnerFound)
      return res.status(422).json({ success: false, message: "No account linked to that email" });

    const token = jwt.sign(
      { id: partnerFound._id, expiration: Date.now() + 10 * 60 * 1000 },
      process.env.JWT_SECRET_KEY
    );
    const url = `${process.env.HOST || "localhost:3000"}/#/authentication/resetPassword/${token}`;
    await sendResetPasswordEmailFunction(url, req.body.email);
    return res.status(200).json({ success: true, message: "Reset password email sent" });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};


// ─────────────────────────────────────────────────────────────────────────────
// RESET PASSWORD
// ─────────────────────────────────────────────────────────────────────────────
const resetPassword = async (req, res) => {
  try {
    const { newPassword, confirmPassword } = req.body;
    if (newPassword !== confirmPassword)
      return res.status(400).json({ success: false, message: "Passwords don't match" });
    if (newPassword.length < 5)
      return res.status(400).json({ success: false, message: "Password minimum length is 5" });

    const token = req.params.token;
    if (!token) return res.status(403).json({ success: false, message: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_RESET_FORGOTTEN_PASSWORD_KEY);
    if (!decoded) return res.status(401).json({ message: "Invalid token" });
    if (Date.now() > decoded.expiration)
      return res.status(422).json({ success: false, message: "Time to reset password exceeded" });

    const partnerFound = await Partner.findById(decoded.id);
    if (!partnerFound) return res.status(404).json({ message: "User not found" });

    partnerFound.password = newPassword;
    await partnerFound.save();
    return res.status(200).json({ success: true, message: "Password updated successfully" });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};


// ─────────────────────────────────────────────────────────────────────────────
// VERIFY OTP
// ─────────────────────────────────────────────────────────────────────────────
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const partner        = await Partner.findOne({ email });

    if (!partner)
      return res.status(400).json({ success: false, message: "Partner not found" });
    if (partner.isOTPExpired())
      return res.status(400).json({ success: false, message: "OTP expired. Please request a new one." });
    if (
      !partner.OTP ||
      partner.OTP.toString().trim().toLowerCase() !== otp.toString().trim().toLowerCase()
    ) return res.status(400).json({ success: false, message: "Invalid OTP. Please try again." });

    partner.status      = true;
    partner.OTPverified = true;
    partner.OTP         = null;
    await partner.save();

    return res.status(200).json({ success: true, message: "OTP verified successfully" });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return res.status(500).json({ success: false, message: "Server error during OTP verification" });
  }
};


// ─────────────────────────────────────────────────────────────────────────────
// UPDATE PASSWORD
// ─────────────────────────────────────────────────────────────────────────────
const updatePassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword)
      return res.status(400).json({ success: false, message: "Email, OTP code, and new password are required" });

    const partner = await Partner.findOne({ email });
    if (!partner) return res.status(404).json({ success: false, message: "Partner not found" });
    if (String(partner.OTP) !== String(code))
      return res.status(400).json({ success: false, message: "Invalid OTP" });

    partner.password = newPassword;
    partner.OTP      = null;
    await partner.save();
    return res.status(200).json({ success: true, message: "Password updated successfully" });
  } catch (err) {
    console.error("Error updating password:", err);
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};


// ─────────────────────────────────────────────────────────────────────────────
// GET ALL PARTNERS
// ─────────────────────────────────────────────────────────────────────────────
const getAllPartners = async (req, res) => {
  try {
    const partners = await Partner.find({}, { password: 0 });
    return res.status(200).json({ success: true, message: "Partners retrieved successfully", partners });
  } catch (error) {
    console.error("Error fetching partners:", error);
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};


// ─────────────────────────────────────────────────────────────────────────────
// UPDATE PARTNER PROFILE — logs "approval" event on first profile submission
// ─────────────────────────────────────────────────────────────────────────────
const updatePartnerProfile = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: "Email is required" });

    const partner = await Partner.findOne({ email });
    if (!partner) return res.status(404).json({ success: false, message: "Partner not found" });

    if (req.body.logo && req.body.logo.length > 500000) {
      return res.status(400).json({
        success: false,
        message: "Logo image file is too large (max 500KB). Please upload a smaller image or image URL."
      });
    }

    const updatedFields = {
      firstName:    req.body.firstName,
      lastName:     req.body.lastName,
      businessName: req.body.businessName,
      logo:         req.body.logo,
      street:       req.body.street,
      city:         req.body.city,
      state:        req.body.state,
      pincode:      req.body.pincode,
      country:      req.body.country,
      description:  req.body.description,
      website:      req.body.website,
      type:         req.body.type,
      yourPosition: req.body.yourPosition,
    };

    Object.keys(updatedFields).forEach(
      (key) => updatedFields[key] === undefined && delete updatedFields[key]
    );

    await Partner.updateOne({ email }, { $set: updatedFields });

    const existingApproval = await Approval.findOne({ email });
    if (!existingApproval) {
      await Approval.create({
        role:         "Partner",
        businessName: updatedFields.businessName || partner.businessName,
        type:         updatedFields.type         || partner.type,
        email:        partner.email,
        website:      updatedFields.website      || partner.website,
        firstName:    updatedFields.firstName    || partner.firstName,
        lastName:     updatedFields.lastName     || partner.lastName,
        position:     updatedFields.yourPosition || partner.yourPosition,
        country:      updatedFields.country      || partner.country,
        date:         new Date().toDateString(),
        status:       "pending",
      });

      // ✅ Log approval-submitted event
      await logEvent({
        role:        "partner",
        email:       partner.email,
        displayName: updatedFields.businessName || partner.businessName || partner.username,
        partnerType: partner.partnerType || "",
        eventType:   "approval",
        title:       "Approval request submitted",
        desc:        `${updatedFields.businessName || partner.businessName} submitted profile for admin review`,
      });
    }

    res.status(200).json({ success: true, message: "Profile updated successfully!" });
  } catch (error) {
    console.error("Error updating partner profile:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};


// ─────────────────────────────────────────────────────────────────────────────
// GET PARTNER BY EMAIL
// ─────────────────────────────────────────────────────────────────────────────
const getPartnerByEmail = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ success: false, message: "Email is required" });

    const partner = await Partner.findOne({ email });
    if (!partner) return res.status(200).json({ success: false, message: "No profile found" });

    const requiredFields = [
      "firstName", "lastName", "businessName", "logo", "street",
      "city", "state", "pincode", "country", "description",
      "website", "type", "yourPosition",
    ];
    const missingFields = requiredFields.filter((f) => !partner[f]);

    if (missingFields.length > 0) {
      return res.status(200).json({ success: true, profileIncomplete: true, missingFields, data: partner });
    }

    const approval = await Approval.findOne({ email: partner.email });
    if (approval && approval.status !== "approved") {
      return res.status(403).json({
        success: false,
        approvalStatus: approval.status,
        message: "Your account is waiting for admin approval",
      });
    }

    return res.status(200).json({ success: true, profileIncomplete: false, data: partner });
  } catch (error) {
    console.error("Error fetching partner:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};


// ─────────────────────────────────────────────────────────────────────────────
// GET PARTNER PROFILE PIC
// ─────────────────────────────────────────────────────────────────────────────
const getPartnerProfilePic = async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ status: false, message: "Email is required" });

  try {
    const partner = await Partner.findOne({ email });
    if (!partner || !partner.logo)
      return res.status(404).json({ status: false, message: "Partner logo not found" });

    res.json({ status: true, profilePic: partner.logo });
  } catch (error) {
    console.error("Error fetching partner logo:", error);
    res.status(500).json({ status: false, message: "Server Error" });
  }
};


module.exports = {
  signUp,
  forgotPassword,
  login,
  sendConfirmationEmail,
  sendResetPasswordEmail,
  resetPassword,
  logout,
  verifyOtp,
  updatePassword,
  getAllPartners,
  updatePartnerProfile,
  getPartnerByEmail,
  getPartnerProfilePic,
};
