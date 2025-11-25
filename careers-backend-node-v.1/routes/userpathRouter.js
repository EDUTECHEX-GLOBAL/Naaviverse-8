const express = require("express");
const router = express.Router();

const User = require('../models/users.model');   // ✅ correct import


const Program = require("../models/program.model");
const UserPathSelection = require("../models/userPathSelection.model");

router.post("/selectpath", async (req, res) => {
  try {
    const { email, universityId } = req.body; // ✔ renamed

    if (!email || !universityId) {
      return res.status(400).json({
        status: false,
        message: "email and universityId are required",
      });
    }

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ status: false, message: "User not found" });

    user.selectedUniversity = universityId;  // ✔ store university
    await user.save();

    return res.status(200).json({
      status: true,
      message: "Path selected successfully",
      universityId
    });

  } catch (error) {
    console.error("error:", error);
    res.status(500).json({ status: false, message: error.message });
  }
});



module.exports = router;