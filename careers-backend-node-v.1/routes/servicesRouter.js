const express = require("express");
const router = express.Router();

const servicesController = require("../controllers/services.controller");

/* ==========================
   CREATE SERVICE
========================== */
router.post("/add", servicesController.addService);

/* ==========================
   GET ALL SERVICES
   /api/services/getservices
========================== */
router.get("/getservices", servicesController.getServices);

/* ==========================
   UPDATE SERVICE
========================== */
router.put("/update/:id", servicesController.updateService);

/* ==========================
   DELETE SERVICE
========================== */
router.delete("/delete/:id", servicesController.deleteService);

/* ==========================
   RESTORE SERVICE
========================== */
router.put("/restore/:id", servicesController.restoreService);

/* ==========================
   GET SERVICES BY STEP
   /api/services/by-step?step_id=xxxx
========================== */
router.get("/by-step", servicesController.getServicesByStep);

/* ==========================
   ⭐ GET SERVICES BY EMAIL
   FRONTEND CALLS:
   /api/services/get/byEmail?email=xxx
========================== */
router.get("/get/byEmail", servicesController.getServicesByEmail);

/* ==========================
   EXPORT ROUTER
========================== */
module.exports = router;
