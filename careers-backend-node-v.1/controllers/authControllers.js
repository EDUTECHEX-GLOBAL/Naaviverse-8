const mongoose = require("mongoose");
const User = require("../models/users.model");
require("dotenv").config({ path: ".env" });
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const BASE_URL = process.env.REACT_APP_API_BASE_URL;
const { generateOTP, sendOTP, sendNotificationMail } = require("../middlewares/verifySignUp");

// ── Activity logger (non-blocking — never breaks login if it fails) ───────────
const { logActivityInternal } = require("./activity.controller");

const signUp = async (req, res) => {
  try {
    const { email, username, password } = req.body;

    if (!email || !username || !password) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    const OTP = generateOTP();

    const user = new User({
      username, email, password,
      OTP, OTPCreatedTime: new Date(),
      OTPverified: false, status: "inactive",
    });

    await user.save();

    sendNotificationMail(email, "Naavi Signup OTP", `Your OTP is <b>${OTP}</b>`)
      .catch(err => console.error("Mail failed:", err));

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: "1d" });

    return res.status(200).json({ success: true, otpSent: true, token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false });
  }
};

const checkEmailDuplicate = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (user) return res.status(400).json({ message: "The email already exists" });
    return res.status(200).json({ message: "Email is available" });
  } catch (error) {
    console.error("Error checking email:", error);
    res.status(500).json({ success: false, message: "Something went wrong, signup failed" });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: "Email is required" });

    const userFound = await User.findOne({ email });
    if (!userFound) return res.status(400).json({ success: false, message: "User not found" });

    const OTP = generateOTP();
    userFound.OTP = OTP;
    userFound.OTPCreatedTime = new Date();
    await userFound.save();

    await sendNotificationMail(
      email,
      "Naavi Password Reset OTP",
      `Dear ${userFound.username},<br>Your OTP for password reset is: <b>${OTP}</b><br>This OTP expires in 10 minutes.`
    );

    const token = jwt.sign({ id: userFound._id }, process.env.JWT_SECRET_KEY, { expiresIn: 86400 });
    return res.status(200).json({ success: true, token, message: "OTP sent successfully to your email address" });
  } catch (err) {
    console.error("Forgot password error:", err);
    return res.status(500).json({ success: false, message: "Something went wrong while sending the OTP" });
  }
};

const sendConfirmationEmail = async (req, res) => {
  try {
    const userFound = await User.findOne({ email: req.body.email });
    if (!userFound) return res.status(404).json({ message: "User not found" });

    const url = `${BASE_URL}/api/auth/verification/${userFound._id}`;

    await sendNotificationMail(
      userFound.email,
      "Naavi Account Confirmation",
      `Dear ${userFound.username || "User"},<br>Please confirm your account:<br><a href="${url}">${url}</a>`
    );

    return res.status(200).json({ success: true, message: "Account confirmation email has been sent successfully" });
  } catch (error) {
    console.error("sendConfirmationEmail error:", error);
    return res.status(500).json({ message: "Something went wrong", error: error.message });
  }
};

const submitForgotPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    if (new Date() - user.OTPCreatedTime > 10 * 60 * 1000) {
      return res.status(400).json({ success: false, message: "OTP expired" });
    }

    if (user.OTP !== code) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    user.password = newPassword;
    user.OTP = null;
    user.OTPCreatedTime = null;
    user.OTPverified = true;
    await user.save();

    return res.status(200).json({ success: true, message: "Password reset successfully" });
  } catch (err) {
    console.error("submitForgotPassword error:", err);
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

// ── LOGIN — activity logging integrated ───────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Both email and password are required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    if (!user.OTPverified) {
      return res.status(401).json({ success: false, message: "Please verify your email via OTP before logging in" });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid password" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: "1d" });

    // ✅ Log login activity — non-blocking, never breaks login
    logActivityInternal({
      userId: user._id.toString(),
      email:  user.email,
      type:   "login",
      title:  "Logged in",
      desc:   `Session started · ${user.city || "Unknown location"}`,
    }).catch(() => {});

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: { id: user._id, username: user.username, email: user.email },
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

const logout = async (req, res) => {
  try {
    res.clearCookie("delivery-app-session-token");
    return res.status(200).json({ success: true, message: "User has logout successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error });
  }
};

const sendResetPasswordEmail = async (req, res) => {
  try {
    const userFound = await User.findOne({ email: req.body.email });
    if (!userFound) return res.status(422).json({ success: false, message: "Doesn't exits account link with that email" });

    const token = jwt.sign(
      { id: userFound._id, expiration: Date.now() + 10 * 60 * 1000 },
      process.env.JWT_SECRET_KEY
    );

    const url = `${process.env.HOST || "localhost:3000"}/#/authentication/resetPassword/${token}`;
    await sendResetPasswordEmailFunction(url, req.body.email);

    return res.status(200).json({ success: true, message: "Reset password email has been send successfully" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: "Something went wrong, fail to to send reset password email" });
  }
};

const resetPassword = async (req, res) => {
  try {
    const token = decodeURIComponent(req.params.token.trim());
    const { newPassword, confirmPassword } = req.body;

    if (!newPassword || !confirmPassword) return res.status(400).json({ message: "Password fields are required" });
    if (newPassword !== confirmPassword)  return res.status(400).json({ message: "Passwords don't match" });

    const decoded  = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const userFound = await User.findById(decoded.id);
    if (!userFound) return res.status(404).json({ message: "User not found" });

    userFound.password = newPassword;
    await userFound.save();

    return res.status(200).json({ success: true, message: "Password updated successfully" });
  } catch (err) {
    console.error("Reset password error:", err);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ success: false, message: "Email and OTP are required" });

    const userFound = await User.findOne({ email });
    if (!userFound) return res.status(404).json({ message: "User not found" });

    if (new Date() - userFound.OTPCreatedTime > 10 * 60 * 1000) {
      return res.status(400).json({ success: false, message: "OTP expired." });
    }

    if (otp !== userFound.OTP) {
      return res.status(400).json({ success: false, message: "OTP doesn't match" });
    }

    userFound.OTPverified = true;
    userFound.OTP = null;
    userFound.OTPCreatedTime = null;
    await userFound.save();

    return res.status(200).json({ success: true, message: "OTP Verified successfully" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: "Something went wrong during OTP verification" });
  }
};

const updatePassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) {
      return res.status(400).json({ success: false, message: "Email, OTP code, and new password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    if (user.OTP !== code) return res.status(400).json({ success: false, message: "Invalid OTP" });

    if (Date.now() - user.OTPCreatedTime > 5 * 60 * 1000) {
      return res.status(400).json({ success: false, message: "OTP expired" });
    }

    user.password = newPassword;
    user.OTP = null;
    user.OTPCreatedTime = null;
    await user.save();

    return res.status(200).json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.error("Error updating password:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const getAllUsers = async (req, res) => {
  console.log("GET /users hit");
  try {
    const users = await User.find();
    return res.status(200).json({ success: true, data: users, message: "Users fetched successfully" });
  } catch (error) {
    console.error("Error fetching all users:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch users" });
  }
};

const getUserProfilePic = async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ status: false, message: "Email is required" });

  try {
    const user = await User.findOne({ email });
    if (!user || !user.profilePicture) {
      return res.status(404).json({ status: false, message: "User profile picture not found" });
    }
    res.json({ status: true, profilePic: user.profilePicture });
  } catch (error) {
    console.error("Error fetching user profile picture:", error);
    res.status(500).json({ status: false, message: "Server Error" });
  }
};

const checkUsername = async (req, res) => {
  try {
    const { username } = req.query;
    if (!username) return res.status(400).json({ available: false, message: "No username provided" });
    const user = await User.findOne({ username });
    return res.json({ available: !user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  signUp, forgotPassword, login,
  checkEmailDuplicate, sendConfirmationEmail,
  sendResetPasswordEmail, resetPassword,
  logout, verifyOTP, updatePassword,
  getAllUsers, getUserProfilePic,
  submitForgotPassword, checkUsername,
};