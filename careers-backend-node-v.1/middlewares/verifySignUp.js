// =========================================
//  📧 BREVO (SENDINBLUE) EMAIL CONTROLLER
// =========================================

require("dotenv").config();
const User = require("../models/UsersModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const axios = require("axios");
const nodemailer = require("nodemailer");


// =========================================
// BREVO CONFIG
// =========================================

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_USER = process.env.BREVO_USER || "b31b04001@smtp-brevo.com";

if (!BREVO_API_KEY) {
  console.error("⚠️ BREVO_API_KEY missing in environment variables (.env)");
}

if (!process.env.EMAIL_SERVICE_USER) {
  console.error("⚠️ EMAIL_SERVICE_USER missing in environment variables (.env)");
}

console.log(
  "📧 Brevo Email Config:",
  process.env.BREVO_API_KEY ? "Key Loaded ✅" : "Key Missing ❌",
  `| Login: ${BREVO_USER}`
);


// =========================================
// OTP GENERATOR
// =========================================
const generateOTP = () => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  console.log("Generated OTP:", otp);
  return otp;
};

// =========================================
// SEND MAIL (MULTIPLE SERVICE SUPPORT)
// =========================================

// Build list of available transporters in priority order
const getTransporters = () => {
  const transporters = [];

  // 1. Brevo (highest priority if key exists)
  if (process.env.BREVO_API_KEY) {
    transporters.push({
      name: "Brevo",
      transporter: nodemailer.createTransport({
        host: "smtp-relay.brevo.com",
        port: 587,
        secure: false,
        auth: {
          user: process.env.BREVO_USER || "b31b04001@smtp-brevo.com",
          pass: process.env.BREVO_API_KEY,
        },
      }),
    });
  }

  // 2. SendGrid
  if (process.env.SENDGRID_API_KEY) {
    transporters.push({
      name: "SendGrid",
      transporter: nodemailer.createTransport({
        host: "smtp.sendgrid.net",
        port: 587,
        secure: false,
        auth: {
          user: "apikey",
          pass: process.env.SENDGRID_API_KEY,
        },
      }),
    });
  }

  // 3. Gmail (fallback)
  if (process.env.EMAIL_SERVICE_USER && process.env.EMAIL_SERVICE_PASS) {
    transporters.push({
      name: "Gmail",
      transporter: nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_SERVICE_USER.trim(),
          pass: process.env.EMAIL_SERVICE_PASS.trim(),
        },
      }),
    });
  }

  return transporters;
};

const sendNotificationMail = async (email, subject, message) => {
  const transporters = getTransporters();

  if (transporters.length === 0) {
    console.error("❌ No email service configuration found in .env (need BREVO_API_KEY, SENDGRID_API_KEY, or EMAIL_SERVICE_USER/PASS)");
    return false;
  }

  const fromUser = process.env.EMAIL_SERVICE_USER || "naaviplatform@gmail.com";
  const mailOptions = {
    from: `"Naavi Platform" <${fromUser}>`,
    to: email,
    subject: subject || "Notification",
    html: message.startsWith("<") ? message : `<p>${message}</p>`,
  };

  // Try each transporter in order until one succeeds
  for (const { name, transporter } of transporters) {
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log(`✅ Email sent via ${name} to ${email}: ${info.messageId}`);
      return true;
    } catch (error) {
      console.warn(`⚠️ ${name} failed: ${error.message} — trying next...`);
    }
  }

  console.error("❌ All email services failed. Could not deliver email to:", email);
  return false;
};


// =========================================
// SIGNUP FUNCTION
// =========================================
const saltRounds = 10;

const signUp = async (req, res) => {
  try {
    const { email, username, password } = req.body;

    // =========================
    // Validate fields
    // =========================
    if (!email || !username || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields required",
      });
    }

    // =========================
    // Check duplicate
    // =========================
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already registered",
      });
    }

    // =========================
    // Create user
    // =========================
    const OTP = generateOTP();
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const temporalUser = new User({
      username,
      email,
      password: hashedPassword,
      OTP,
      OTPCreatedTime: new Date(),
      OTPverified: false,
      status: false,
    });

    await temporalUser.save();

    // =========================
    // Send OTP Email
    // =========================
const mailSent = await sendNotificationMail(
  email,
  "Verify your account 🔐",
  `
  <div style="
    background:#f3f7fb;
    padding:40px 10px;
    font-family:Arial, sans-serif;
    text-align:center;
  ">

    <div style="
      max-width:450px;
      margin:auto;
      background:#ffffff;
      padding:35px;
      border-radius:12px;
      box-shadow:0 10px 25px rgba(0,0,0,0.08);
    ">

      <!-- Logo (only image, no domain text) -->
      <img 
        src="/favicon3.png"
        width="90"
        style="margin-bottom:18px;"
        alt="Logo"
      />

      <h2 style="margin:0;color:#222;">
        Welcome 👋
      </h2>

      <p style="color:#555;font-size:14px;line-height:1.6;margin-top:12px;">
        Thanks for registering.<br/>
        Please verify your email using the OTP below.
      </p>

      <div style="
        margin:25px 0;
        font-size:34px;
        font-weight:bold;
        letter-spacing:7px;
        background:#00B5F9;
        color:#ffffff;
        padding:14px 0;
        border-radius:8px;
      ">
        ${OTP}
      </div>

      <p style="font-size:12px;color:#888;">
        This code expires in 5 minutes.
      </p>

    </div>
  </div>
  `
);

    if (!mailSent) {
      return res.status(500).json({
        success: false,
        message: "Email sending failed. Please try again.",
      });
    }

    // =========================
    // Generate JWT
    // =========================
    const token = jwt.sign(
      { id: temporalUser._id },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1d" }
    );

    return res.status(201).json({
      success: true,
      message: "User created successfully. OTP sent.",
      token,
      user: {
        id: temporalUser._id,
        username: temporalUser.username,
        email: temporalUser.email,
      },
    });

  } catch (error) {
    console.error("❌ SignUp Error:", error);

    return res.status(500).json({
      success: false,
      message: "Signup failed",
    });
  }
};


// =========================================
// VERIFY OTP
// =========================================
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const userFound = await User.findOne({ email });

    if (!userFound) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (otp !== userFound.OTP) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    const otpAge = Date.now() - new Date(userFound.OTPCreatedTime).getTime();

    if (otpAge > 5 * 60 * 1000) {
      return res.status(400).json({ success: false, message: "OTP expired" });
    }

    userFound.OTPverified = true;
    userFound.status = true;

    await userFound.save();

    return res.status(200).json({
      success: true,
      message: "OTP Verified successfully",
    });

  } catch (err) {
    console.error("❌ Verify OTP Error:", err);

    return res.status(500).json({
      success: false,
      message: "OTP verification failed",
    });
  }
};


// =========================================
module.exports = {
  signUp,
  verifyOTP,
  generateOTP,
  sendNotificationMail,
};
