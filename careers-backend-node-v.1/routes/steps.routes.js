const router = require("express").Router();
const stepController = require("../controllers/steps.controller");

// GET ALL STEPS
router.get("/get", stepController.getSteps);

// SERVICES
router.post("/services/add", stepController.addServicesToStep);
router.delete("/services/:stepId/:serviceId", stepController.removeServiceFromStep);
router.get("/services/:step_id", stepController.getServicesOfStep);
router.get("/services/remove/:step_id", stepController.getAllServicesForRemove);
// steps.routes.js
router.put("/update/:id", async (req, res) => {
  try {
    const updated = await stepModel.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.json({ status: true, data: updated });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
});
// CRUD
router.post("/add", stepController.addStep);
router.put("/update/:id", stepController.updateStep);
router.delete("/delete/:id", stepController.deleteStep);
router.put("/restore/:id", stepController.restoreStep);

module.exports = router;
