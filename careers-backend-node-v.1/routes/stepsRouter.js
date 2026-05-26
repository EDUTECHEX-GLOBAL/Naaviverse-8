var express = require("express");
var router = express.Router();

const StepsController = require("../controllers/StepsController");
const { verifyToken } = require("../middlewares/authJwt");

router.post("/add", StepsController.addStep);
router.get("/get", StepsController.getSteps);
router.put("/update/:id", StepsController.updateStep);
router.delete("/delete/:id", StepsController.deleteStep);
router.put("/restore/:id", [verifyToken], StepsController.restoreStep);

router.put("/detach/:stepId", StepsController.detachStepFromPath);
router.put("/toggle-status/:stepId", StepsController.toggleStepStatus);
// ⭐ BULK UPLOAD (KEEP BEFORE dynamic routes)
router.post("/bulk", StepsController.bulkUploadSteps);
console.log("bulkUploadSteps =>", StepsController.bulkUploadSteps);
 



// ⭐ ADD THIS — MUST BE ABOVE /:id ⭐
router.get("/partner", StepsController.getStepsByPartner);

router.patch("/editstep", StepsController.editStep);
router.post("/attachservice", StepsController.addServicesToStep);
router.get("/getall/:step_id", StepsController.getServicesForStep);
router.delete("/remove/:stepId/:serviceId", StepsController.removeServiceFromStep);

router.get("/:id", StepsController.getStepById);

module.exports = router;
