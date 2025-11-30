const router = require("express").Router();
const Services = require("../models/services.model");

// Get services by step
router.get("/by-step", async (req, res) => {
  try {
    const { step_id } = req.query;

    const services = await Services.find({ step_id });
    return res.json({ status: true, data: services });
  } catch (err) {
    res.status(500).json({ status: false, message: "Server error" });
  }
});

// Add service to step
router.post("/add", async (req, res) => {
  try {
    const service = await Services.create(req.body);
    res.json({ status: true, data: service });
  } catch (err) {
    res.status(500).json({ status: false, message: "Failed to add service" });
  }
});

module.exports = router;
