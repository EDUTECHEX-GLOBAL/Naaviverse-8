const router = require("express").Router();
const StepController = require("../controllers/Steps.Controller");

// GET ALL STEPS
router.get("/get", StepController.getSteps);

// SERVICES
router.post("/services/add", StepController.addServicesToStep);
router.delete("/services/:stepId/:serviceId", StepController.removeServiceFromStep);
router.get("/services/:step_id", StepController.getServicesOfStep);
router.get("/services/remove/:step_id", StepController.getAllServicesForRemove);
// steps.routes.js

// CRUD
router.post("/add", StepController.addStep);
router.put("/update/:id", StepController.updateStep);

router.patch("/edit/:id", StepController.editStep);

router.delete("/delete/:id", StepController.deleteStep);
router.put("/restore/:id", StepController.restoreStep);

module.exports = router;
