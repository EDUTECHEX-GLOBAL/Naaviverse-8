const AdminUser = require('../models/AdminUser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const loginAdmin = async (req, res) => {
  try {
    let { email, password } = req.body;

    // validate input
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    // normalize email
    email = email.trim().toLowerCase();

    // find admin
    const admin = await AdminUser.findOne({ email });

    if (!admin) {
      return res.status(400).json({ message: "Email not found" });
    }

    // check password
console.log("EMAIL FROM FRONTEND:", email);
console.log("PASSWORD FROM FRONTEND:", JSON.stringify(password));
console.log("HASH IN DB:", admin.password);

const isMatch = await bcrypt.compare(password, admin.password);
console.log("MATCH RESULT:", isMatch);

    if (!isMatch) {
      return res.status(400).json({ message: "Wrong password" });
    }

    // create JWT token
    const token = jwt.sign(
      { id: admin._id, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      message: "Login successful",
      token
    });

  } catch (error) {
    console.error("Admin Login Error:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

module.exports = { loginAdmin };