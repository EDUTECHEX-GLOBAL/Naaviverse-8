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
      OTPverified: false, OTPCreatedTime: currentTime,
      status: false,
      creationSource: "self_registered",
      createdBy: "self_registered",
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

    if (partner.isBlocked || partner.accountStatus === "inactive") {
      return res.status(403).json({
        success: false,
        message: "Your account is currently inactive. Please contact administrator.",
      });
    }

    const isInternal = partner.creationSource === "admin_created";
    const approval       = await Approval.findOne({ email: partner.email.toLowerCase().trim() });
    const profileCreated = Boolean(partner.businessName && partner.website);
    
    let approvalStatus = "not_submitted";
    if (isInternal) {
      approvalStatus = "approved";
    } else if (approval) {
      approvalStatus = approval.status || "pending";
    }

    const token = jwt.sign({ id: partner._id }, process.env.JWT_SECRET_KEY, { expiresIn: "1d" });

    // ✅ Fire-and-forget activity log — never blocks the login response
    await logEvent({
      role:        "partner",
      email:       partner.email,
      displayName: partner.businessName || partner.username || email,
      partnerType: partner.partnerType  || "",
      eventType:   "login",
      title:       "Partner Logged In",
      desc:        `${partner.businessName || partner.username || email} signed in to the portal`,
    }).catch(err => console.error("Partner login activity log error:", err));

    // Ensure partnerId exists on the partner document
    if (!partner.partnerId) {
      const pType = (partner.partnerType || "GEN").slice(0, 4).toUpperCase();
      const shortId = String(partner._id).slice(-4).toUpperCase();
      partner.partnerId = `NVP-${pType}-${new Date().getFullYear()}-${shortId}`;
      await partner.save();
    }

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      mustChangePassword: partner.mustChangePassword === true || partner.mustChangePassword === "true",
      partner: {
        id:                 partner._id,
        partnerId:          partner.partnerId,
        username:           partner.username,
        businessName:       partner.businessName || partner.username,
        email:              partner.email,
        partnerType:        partner.partnerType,
        creationSource:     partner.creationSource || (isInternal ? "admin_created" : "self_registered"),
        mustChangePassword: partner.mustChangePassword === true || partner.mustChangePassword === "true",
        accountStatus:      partner.isBlocked ? "inactive" : (partner.accountStatus || "active"),
        profileCreated,
        approvalStatus,
        status:             approvalStatus,
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

    let logoData = req.body.logo;
    // Automatically sanitize oversized raw base64 strings (>200KB) to prevent DB bloat and Compass UI crashes
    if (logoData && typeof logoData === "string" && logoData.length > 200000) {
      console.warn(`[PartnersController] Base64 logo size (${logoData.length} chars) is too large for inline DB storage. Preserving existing logo.`);
      logoData = partner.logo || "";
    }

    const updatedFields = {
      firstName:    req.body.firstName,
      lastName:     req.body.lastName,
      businessName: req.body.businessName,
      logo:         logoData,
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

    const isInternal = partner.creationSource === "admin_created";
    const targetStatus = isInternal ? "approved" : "pending";

    const existingApproval = await Approval.findOne({ email });
    if (!existingApproval) {
      await Approval.create({
        role:         "Partner",
        businessName: updatedFields.businessName || partner.businessName,
        type:         updatedFields.type         || partner.partnerType || partner.type,
        email:        partner.email,
        website:      updatedFields.website      || partner.website,
        firstName:    updatedFields.firstName    || partner.firstName,
        lastName:     updatedFields.lastName     || partner.lastName,
        position:     updatedFields.yourPosition || partner.yourPosition,
        country:      updatedFields.country      || partner.country,
        date:         new Date().toDateString(),
        status:       targetStatus,
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
    } else if (!isInternal && existingApproval.status !== "approved") {
      existingApproval.status = "pending";
      existingApproval.businessName = updatedFields.businessName || partner.businessName;
      existingApproval.website = updatedFields.website || partner.website;
      await existingApproval.save();
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


// ─────────────────────────────────────────────────────────────────────────────
// INTERNAL PARTNERS MANAGEMENT (SUPER ADMIN CONTROLLED)
// ─────────────────────────────────────────────────────────────────────────────

// CREATE INTERNAL PARTNER
const createInternalPartner = async (req, res) => {
  try {
    const {
      partnerName,
      organizationName,
      contactPerson,
      lastName,
      email,
      phone,
      category,
      website,
      yourPosition,
      street,
      city,
      state,
      pincode,
      country,
      description,
      tempPassword,
      accountStatus,
    } = req.body;

    if (!partnerName || !email || !contactPerson || !tempPassword) {
      return res.status(400).json({
        success: false,
        message: "Partner name, contact person, email, and temporary password are required",
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existingPartner = await Partner.findOne({ email: cleanEmail });
    if (existingPartner) {
      return res.status(400).json({ success: false, message: "A partner with this email already exists" });
    }

    // Auto-generate partnerId
    const prefix = "NVP";
    const cleanUser = (partnerName || cleanEmail).replace(/[^a-zA-Z0-9]/g, "");
    const code = cleanUser.slice(0, 3).toUpperCase() || "INT";
    const year = new Date().getFullYear();
    const tempObjId = new mongoose.Types.ObjectId();
    const shortId = tempObjId.toString().slice(-6).toUpperCase();
    const partnerId = `${prefix}-${code}-${year}-${shortId}`;

    const newPartner = new Partner({
      _id: tempObjId,
      partnerId,
      username: partnerName,
      businessName: organizationName || partnerName || "Naaviverse Internal",
      firstName: contactPerson,
      lastName: lastName || "",
      email: cleanEmail,
      password: tempPassword, // pre-save hook will hash password!
      phone: phone || "",
      type: category || "Education & Learning",
      partnerType: category || "Education & Learning",
      website: website || "",
      yourPosition: yourPosition || "Internal Partner",
      street: street || "",
      city: city || "",
      state: state || "",
      pincode: pincode || "",
      country: country || "India",
      creationSource: "admin_created",
      mustChangePassword: true, // ALWAYS true upon admin creation
      accountStatus: accountStatus || "active",
      isBlocked: accountStatus === "inactive",
      OTPverified: true,
      status: true, // Auto-approved for internal partners!
      createdBy: "Super Admin",
      description: description || "Internal partner account.",
    });

    await newPartner.save();

    // Also auto-create approved record in Approval collection so internal partners bypass approval check
    await Approval.create({
      role: "Partner",
      businessName: newPartner.businessName,
      type: newPartner.partnerType,
      email: cleanEmail,
      firstName: contactPerson,
      date: new Date().toDateString(),
      status: "approved",
    }).catch(err => console.log("Approval record auto-creation notice:", err.message));

    // Log activity
    await logEvent({
      role: "admin",
      email: "admin@naaviverse.com",
      displayName: "Super Admin",
      eventType: "partner_creation",
      title: "Internal Partner Created",
      desc: `Super Admin created internal partner: ${partnerName} (${cleanEmail})`,
    }).catch(() => {});

    // Send Welcome Email with Login Credentials
    const mailBody = `
      <div style="font-family: Arial, sans-serif; max-width: 580px; margin: 0 auto; padding: 28px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; color: #1e293b;">
        <h2 style="color: #2563eb; margin-top: 0;">Welcome to Naaviverse Partner Network!</h2>
        <p>Dear <strong>${contactPerson}</strong>,</p>
        <p>An internal partner account has been created for <strong>${partnerName}</strong> (${organizationName || "Naaviverse Internal"}).</p>
        
        <div style="background: #f8fafc; border-left: 4px solid #2563eb; border-radius: 6px; padding: 16px 20px; margin: 20px 0;">
          <h4 style="margin: 0 0 10px 0; color: #0f172a; text-transform: uppercase; font-size: 13px; letter-spacing: 0.5px;">Your Account Credentials:</h4>
          <p style="margin: 6px 0; font-size: 14px;"><strong>Login Email:</strong> ${cleanEmail}</p>
          <p style="margin: 6px 0; font-size: 14px;"><strong>Temporary Password:</strong> <span style="background: #e2e8f0; padding: 3px 8px; border-radius: 4px; font-family: monospace; font-size: 14px; font-weight: bold; color: #d97706;">${tempPassword}</span></p>
          <p style="margin: 10px 0 0 0; font-size: 12px; color: #64748b;">(Note: You will be prompted to update this password when you log in.)</p>
        </div>

        <p>Log in using the link below to access your partner dashboard and manage your offerings:</p>
        <p style="text-align: center; margin: 24px 0;">
          <a href="${process.env.PARTNER_LOGIN_URL || "http://localhost:3000/login?type=partner"}" style="background: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Log In to Partner Portal</a>
        </p>
        
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="font-size: 12px; color: #94a3b8; text-align: center; margin: 0;">This is an automated invitation email from Naaviverse Super Admin.</p>
      </div>
    `;

    await sendNotificationMail(
      cleanEmail,
      "Welcome to Naaviverse — Your Partner Account Credentials",
      mailBody
    ).catch((err) => console.error("Internal Partner email delivery error:", err.message));

    return res.status(201).json({
      success: true,
      message: `Internal Partner "${partnerName}" created successfully`,
      data: {
        id: newPartner._id,
        partnerId: newPartner.partnerId,
        partnerName: newPartner.username,
        organizationName: newPartner.businessName,
        contactPerson: newPartner.firstName,
        email: newPartner.email,
        phone: newPartner.phone,
        category: newPartner.partnerType,
        description: newPartner.description,
        partnerType: "internal",
        creationSource: newPartner.creationSource,
        accountStatus: newPartner.accountStatus,
        mustChangePassword: newPartner.mustChangePassword,
        createdBy: newPartner.createdBy,
        createdAt: newPartner.createdAt ? new Date(newPartner.createdAt).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
        lastLogin: "Never",
        totalOfferings: 0,
        totalRevenue: "₹0",
      },
    });
  } catch (error) {
    console.error("createInternalPartner Error:", error);
    return res.status(500).json({ success: false, message: "Error creating internal partner", error: error.message });
  }
};

// GET ALL INTERNAL PARTNERS
const getAllInternalPartners = async (req, res) => {
  try {
    const internalPartners = await Partner.find({
      $or: [
        { creationSource: "admin_created" },
        { partnerType: /^internal$/i }
      ]
    }).sort({ createdAt: -1 }).lean();

    const formatted = internalPartners.map(p => ({
      id: p._id,
      partnerId: p.partnerId,
      partnerName: p.username || p.businessName || "Unnamed Partner",
      organizationName: p.businessName || "Naaviverse Internal",
      contactPerson: p.firstName || p.username || "—",
      firstName: p.firstName || "",
      lastName: p.lastName || "",
      email: p.email,
      phone: p.phone || "—",
      category: p.partnerType || "Education & Learning",
      website: p.website || "",
      yourPosition: p.yourPosition || "",
      street: p.street || "",
      city: p.city || "",
      state: p.state || "",
      pincode: p.pincode || "",
      country: p.country || "India",
      description: p.description || "",
      partnerType: "internal",
      creationSource: p.creationSource || "admin_created",
      accountStatus: p.isBlocked ? "inactive" : (p.accountStatus || "active"),
      mustChangePassword: !!p.mustChangePassword,
      createdBy: p.createdBy || "Super Admin",
      createdAt: p.createdAt ? new Date(p.createdAt).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
      lastLogin: p.updatedAt ? new Date(p.updatedAt).toLocaleString() : "Never",
      totalOfferings: 0,
      totalRevenue: "₹0",
    }));

    return res.status(200).json({ success: true, count: formatted.length, data: formatted });
  } catch (error) {
    console.error("getAllInternalPartners Error:", error);
    return res.status(500).json({ success: false, message: "Error fetching internal partners" });
  }
};

// UPDATE INTERNAL PARTNER
const updateInternalPartner = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      partnerName,
      organizationName,
      contactPerson,
      phone,
      category,
      description,
      accountStatus,
      mustChangePassword,
    } = req.body;

    const partner = await Partner.findById(id);
    if (!partner) {
      return res.status(404).json({ success: false, message: "Internal Partner not found" });
    }

    if (partnerName) partner.username = partnerName;
    if (organizationName) partner.businessName = organizationName;
    if (contactPerson) partner.firstName = contactPerson;
    if (phone !== undefined) partner.phone = phone;
    if (category) partner.partnerType = category;
    if (description !== undefined) partner.description = description;
    if (accountStatus) {
      partner.accountStatus = accountStatus;
      partner.isBlocked = (accountStatus === "inactive");
    }
    if (mustChangePassword !== undefined) partner.mustChangePassword = mustChangePassword;

    await partner.save();

    return res.status(200).json({
      success: true,
      message: "Internal Partner updated successfully",
      data: {
        id: partner._id,
        partnerId: partner.partnerId,
        partnerName: partner.username,
        organizationName: partner.businessName,
        contactPerson: partner.firstName,
        email: partner.email,
        phone: partner.phone,
        category: partner.partnerType,
        description: partner.description,
        partnerType: "internal",
        creationSource: partner.creationSource || "admin_created",
        accountStatus: partner.isBlocked ? "inactive" : (partner.accountStatus || "active"),
        mustChangePassword: partner.mustChangePassword,
        createdBy: partner.createdBy || "Super Admin",
        createdAt: partner.createdAt ? new Date(partner.createdAt).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
      }
    });
  } catch (error) {
    console.error("updateInternalPartner Error:", error);
    return res.status(500).json({ success: false, message: "Error updating internal partner" });
  }
};

// TOGGLE PARTNER STATUS (active / inactive)
const toggleInternalPartnerStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const partner = await Partner.findById(id);
    if (!partner) {
      return res.status(404).json({ success: false, message: "Partner not found" });
    }

    const currentStatus = partner.isBlocked ? "inactive" : (partner.accountStatus || "active");
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    partner.accountStatus = newStatus;
    partner.isBlocked = (newStatus === "inactive");

    await partner.save();

    return res.status(200).json({
      success: true,
      message: `Partner status changed to ${newStatus}`,
      accountStatus: newStatus,
    });
  } catch (error) {
    console.error("toggleInternalPartnerStatus Error:", error);
    return res.status(500).json({ success: false, message: "Error toggling status" });
  }
};

// RESET PARTNER PASSWORD
const resetInternalPartnerPassword = async (req, res) => {
  try {
    const { partnerId, newTempPassword } = req.body;
    if (!partnerId || !newTempPassword) {
      return res.status(400).json({ success: false, message: "partnerId and newTempPassword are required" });
    }

    const partner = await Partner.findOne({
      $or: [
        { _id: mongoose.Types.ObjectId.isValid(partnerId) ? partnerId : null },
        { email: partnerId }
      ]
    });

    if (!partner) {
      return res.status(404).json({ success: false, message: "Partner not found" });
    }

    partner.password = newTempPassword; // pre-save hook will hash password!
    partner.mustChangePassword = true;
    await partner.save();

    // Send Password Reset Email
    const resetMailBody = `
      <div style="font-family: Arial, sans-serif; max-width: 580px; margin: 0 auto; padding: 28px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; color: #1e293b;">
        <h2 style="color: #2563eb; margin-top: 0;">Password Reset — Naaviverse Partner Account</h2>
        <p>Dear <strong>${partner.firstName || partner.username || "Partner"}</strong>,</p>
        <p>Your password for internal partner account <strong>${partner.username || partner.businessName}</strong> has been reset by the Super Admin.</p>
        
        <div style="background: #f8fafc; border-left: 4px solid #2563eb; border-radius: 6px; padding: 16px 20px; margin: 20px 0;">
          <h4 style="margin: 0 0 10px 0; color: #0f172a; text-transform: uppercase; font-size: 13px; letter-spacing: 0.5px;">New Temporary Credentials:</h4>
          <p style="margin: 6px 0; font-size: 14px;"><strong>Login Email:</strong> ${partner.email}</p>
          <p style="margin: 6px 0; font-size: 14px;"><strong>New Temporary Password:</strong> <span style="background: #e2e8f0; padding: 3px 8px; border-radius: 4px; font-family: monospace; font-size: 14px; font-weight: bold; color: #d97706;">${newTempPassword}</span></p>
          <p style="margin: 10px 0 0 0; font-size: 12px; color: #64748b;">(Note: You will be required to update this temporary password upon login.)</p>
        </div>

        <p style="text-align: center; margin: 24px 0;">
          <a href="${process.env.PARTNER_LOGIN_URL || "http://localhost:3000/login?type=partner"}" style="background: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Log In Now</a>
        </p>
        
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="font-size: 12px; color: #94a3b8; text-align: center; margin: 0;">This is an automated notification from Naaviverse Super Admin.</p>
      </div>
    `;

    await sendNotificationMail(
      partner.email,
      "Password Reset Notice — Naaviverse Partner Credentials",
      resetMailBody
    ).catch((err) => console.error("Password reset email delivery error:", err.message));

    return res.status(200).json({
      success: true,
      message: `Password reset successfully for ${partner.username || partner.email}`,
    });
  } catch (error) {
    console.error("resetInternalPartnerPassword Error:", error);
    return res.status(500).json({ success: false, message: "Error resetting password" });
  }
};

// CHANGE PARTNER PASSWORD
const changePartnerPassword = async (req, res) => {
  try {
    const { email, oldPassword, newPassword } = req.body;
    if (!email || !oldPassword || !newPassword) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const partner = await Partner.findOne({ email: email.toLowerCase() });
    if (!partner) {
      return res.status(404).json({ success: false, message: "Partner not found" });
    }

    const isMatch = await partner.matchPassword(oldPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Current password is incorrect" });
    }

    partner.password = newPassword; // pre-save hook will hash it!
    partner.mustChangePassword = false;
    await partner.save();

    return res.status(200).json({ success: true, message: "Password updated successfully!" });
  } catch (error) {
    console.error("changePartnerPassword Error:", error);
    return res.status(500).json({ success: false, message: "Error updating password" });
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
  createInternalPartner,
  getAllInternalPartners,
  updateInternalPartner,
  toggleInternalPartnerStatus,
  resetInternalPartnerPassword,
  changePartnerPassword,
};

