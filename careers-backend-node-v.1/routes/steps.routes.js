// routes/steps.routes.js
const router = require("express").Router();

// Example controller logic – adjust to your DB
router.get("/get", async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ status: false, message: "Email required" });
    }

    // TODO: replace with your model/query
    // const steps = await StepsModel.find({ email });

    const steps = []; // temporary placeholder
    return res.json({ status: true, data: steps });
  } catch (err) {
    console.error("Error in /steps/get:", err);
    return res.status(500).json({ status: false, message: "Server error" });
  }
});

module.exports = router;
