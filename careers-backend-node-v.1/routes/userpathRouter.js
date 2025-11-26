const express = require("express");
const router = express.Router();

const User = require('../models/users.model');

// SELECT PATH
router.post("/selectpath", async (req, res) => {
  try {
    const { email, universityId } = req.body;

    if (!email || !universityId) {
      return res.status(400).json({
        status: false,
        message: "email and universityId are required",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        status: false, 
        message: "User not found"
      });
    }

    user.selectedUniversity = universityId;
    await user.save();

    return res.status(200).json({
      status: true,
      message: "Path selected successfully",
      universityId,
    });
  } catch (error) {
    console.error("error:", error);
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
});

const University = require("../models/universities.model");

// GET STEPS FOR SELECTED UNIVERSITY
router.get("/steps", async (req, res) => {
  try {
    const { universityId } = req.query;

    if (!universityId) {
      return res.status(400).json({
        success: false,
        message: "universityId is required"
      });
    }

    // Find the university document
    const uni = await University.findById(universityId);

    if (!uni) {
      return res.status(404).json({
        success: false,
        message: "University not found"
      });
    }

    // Extract generatedProgram fields
    const gp = uni.generatedProgram;

    if (!gp) {
      return res.status(404).json({
        success: false,
        message: "No generated program found for this university"
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        school: uni.name,
        program: gp.program,
        description: gp.description,
        steps: gp.steps || []
      }
    });
  } catch (error) {
    console.error("Error fetching university steps:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});
// GET SELECTED UNIVERSITY FOR USER
router.get("/selected", async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      universityId: user.selectedUniversity || null,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});



module.exports = router;
