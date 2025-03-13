const mongoose = require("mongoose");
const User = require("../models/users.model");
require("dotenv").config({ path: ".env" });
const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');

const { generateOTP, sendOTP, sendNotificationMail  } = require("../middlewares/verifySignUp");

const signUp = async (req, res) => {
  try {
    const { email, username, password } = req.body;

    // Validate input fields
    if (!email || !username || !password) {
      return res.status(400).json({
        successful: false,
        message: "All fields (email, username, password) are required",
      });
    }

    // Check if the email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        successful: false,
        message: "User is already registered with this email",
      });
    }

    const OTP = generateOTP();
    console.log(`Generated OTP: ${OTP}`);
    const currentTime = new Date();

    // Create a new user
    const temporalUser = new User({
      username,
      email,
      password, // Ensure you hash the password before saving
      OTP,
      isBlocked: false,
      OTPAttempts: 0,
      OTPCreatedTime: currentTime,
      status: false,
      profileCompleted: false,
    });

    await temporalUser.save();

    // Send OTP email
    sendNotificationMail(
      email,
      "Naavi Registration Confirmation OTP",
      `Dear User,<br>Your OTP: ${OTP}<br>`
    );

    // Generate JWT token
    const oneDayInSeconds = 86400;
    const token = jwt.sign({ id: temporalUser._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: oneDayInSeconds,
    });

    // Prepare the response user object
    const user = {
      id: temporalUser._id,
      username: temporalUser.username,
      email: temporalUser.email,
    };

    return res.status(201).json({
      successful: true,
      message: "User created successfully",
      token,
      user,
    });
  } catch (error) {
    console.error("SignUp Error:", error);
    return res.status(500).json({
      successful: false,
      message: "Something went wrong",
    });
  }
};

const checkDuplicatedEmail = async (req, res) => {
  try {

    const user = await User.findOne({ email: req.body.email });

    if (user && user.userType == req.body.role) {
      console.log("User found:", user.email);
      return res.status(400).json({ message: "The email already exists" });
    }

    console.log("No user found, proceeding...");
    return res.status(200).json({ message: "Email is available" }); // ✅ Send response here
  } catch (error) {
    console.error("Error checking email:", error);
    res.status(500).json({ success: false, message: "Something went wrong, signup failed" });
  }
};


// const checkDuplicatedUsername = async (req, res, next) => {
//   try {
//     const user = await User.findOne({ username: req.body.username });
//     if (user)
//       return res.status(400).json({ message: "The username already exists" });
    
//       return res.status(200).json({
//         successful: true,
//         message: "The username valid",
//       });
//   } catch (error) {
//     res
//       .status(500)
//       .json({ success: false, message: "Something went wrong , signup fail" });
//   }
// };

const forgotPassword = async (req, res) => {
  var userFound

  if(typeof(req.body.email) !== "undefined")
      userFound = await User.findOne({ email: req.body.email });
  
  if (!userFound) return res.status(400).json({ message: "User Not Found" });

  const OTP = generateOTP();
  console.log(OTP);
  const currentTime = new Date();
  userFound.OTP=OTP;
  userFound.OTPCreatedTime=currentTime;

  
  await userFound.save();
  sendNotificationMail(req.body.email,"Naavi forgot password OTP", "Dear User,<br>Your OTP:"+OTP+" <br>" );
    //sendOTP(req.body.email, OTP);
    console.log(userFound._id);
    const oneDayInSeconds = 86400;

    const token = jwt.sign({ id: userFound._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: oneDayInSeconds,
    });

  return res.status(200).json({
    success: true,
    token: token,
    message: "OTP sent to your emailId",
  });
}
const sendConfirmationEmail = async (req, res) => {
  try {
    const userFound = await TemporalUser.findOne({ email: req.body.email });

    const token = userFound.emailToken;

    const url = `${
      process.env.HOST || "localhost:7000"
    }/api/auth/verification/${token}`;

    await sendConfirmationEmailFunction(url, userFound.email);

    return res.status(200).json({
      success: true,
      message: "Account confirmation email has been send successfully",
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({ message: "something went wrong" });
  }
};


const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input fields
    if (!email || !password) {
      return res.status(400).json({
        successful: false,
        message: "Both email and password are required",
      });
    }

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        successful: false,
        message: "Invalid credentials",
      });
    }

    // Compare the entered password with the stored hashed password
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        successful: false,
        message: "Invalid password",
      });
    }

    // Generate a JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: '1d' });

    // Send the response with user data and token
    return res.status(200).json({
      successful: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({
      successful: false,
      message: "Something went wrong",
    });
  }
};

const logout = async (req, res) => {
  try {
    res.clearCookie("delivery-app-session-token");
    return res
      .status(200)
      .json({ successfully: true, message: "User has logout successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error });
  }
};

const sendResetPasswordEmail = async (req, res) => {
  try {
    const userFound = await User.findOne({ email: req.body.email });

    if (!userFound)
      return res.status(422).json({
        successful: false,
        message: "Doesn't exits account link with that email",
      });

    const id = userFound._id;

    const token = jwt.sign(
      {
        id,
        expiration: Date.now() + 10 * 60 * 1000,
      },
      process.env.JWT_SECRET_KEY
    );

    const url = `${
      process.env.HOST || "localhost:3000"
    }/#/authentication/resetPassword/${token}`;

    await sendResetPasswordEmailFunction(url, req.body.email);

    return res.status(200).json({
      success: true,
      message: "Reset password email has been send successfully",
    });
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      successful: false,
      message: "Something went wrong, fail to to send reset password email",
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
      return res
        .status(400)
        .json({ successful: false, message: "Passwords don't match" });
    }

    if (newPassword.length < 5) {
      return res
        .status(400)
        .json({ successful: false, message: "Password minimum length is 5" });
    }

    const token = req.params.token;

    if (!token)
      return res
        .status(403)
        .json({ success: false, message: "No token provided" });

    const decoded = jwt.verify(
      token,
      process.env.JWT_RESET_FORGOTTEN_PASSWORD_KEY
    );

    if (!decoded) return res.status(401).json({ message: "Invalid token" });

    if (Date.now() > decoded.expiration) {
      return res.status(422).json({
        successful: false,
        message: "Time to reset password exceeded",
      });
    }

    const userFound = await User.findById(decoded.id);

    if (!userFound) return res.status(404).json({ message: "User not found" });

    const hashedPassword = await User.encryptPassword(newPassword);

    userFound.password = hashedPassword;

    await userFound.save();

    return res
      .status(200)
      .json({ success: true, message: "Password updated successfully" });
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      successful: false,
      message: "Something went wrong, fail to update password",
    });
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body; // Extract email and OTP from body

    // Check if email and OTP are provided
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: "Email and OTP are required" });
    }

    // Find user by email
    const userFound = await User.findOne({ email });
    if (!userFound) return res.status(404).json({ message: "User not found" });

    // Check if OTP matches
    if (otp !== userFound.OTP) {
      return res.status(400).json({ successful: false, message: "OTP doesn't match" });
    }

    // Mark OTP as verified
    userFound.OTPverified = true;
    await userFound.save();

    return res.status(200).json({ success: true, message: "OTP Verified successfully" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ successful: false, message: "Something went wrong during OTP verification" });
  }
};

const updatePassword = async (req, res) => {
  try {
    const { password, token } = req.body;

    if (!token)
      return res
        .status(403)
        .json({ success: false, message: "No token provided" });

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET_KEY
    );

    if (!decoded) return res.status(401).json({ message: "Invalid token" });

    const id = decoded.id;

    const userFound = await User.findById(id);

    if (!userFound) return res.status(404).json({ message: "User not found" });

    
    userFound.password = password;

    await userFound.save();

    return res
      .status(200)
      .json({ success: true, message: "Password Updated successfully" });
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      successful: false,
      message: "Something went wrong, fail to update password",
    });
  }
};
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find(); // Fetch all users from the database

    // Return the users
    return res.status(200).json({
      successful: true,
      data: users, // Send the array of users in the 'data' field
      message: "Users fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching all users:", error);
    return res.status(500).json({
      successful: false,
      message: "Failed to fetch users",
    });
  }
};


const getUserProfilePic = async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ status: false, message: "Email is required" });
  }

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




module.exports = {
  signUp,
  forgotPassword,
  login,
  checkDuplicatedEmail,
  sendConfirmationEmail,
  sendResetPasswordEmail,
  resetPassword,
  logout,
  verifyOTP,
  updatePassword,
  getAllUsers,
  getUserProfilePic,
};
