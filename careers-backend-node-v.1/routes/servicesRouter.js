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
router.put("/restore/:id", [verifyToken], servicesController.restoreService);
router.get("/getservices", servicesController.getAllServices);
router.put("/icon/:serviceId", servicesController.updateServiceIcon);
router.post("/bulk", servicesController.bulkUploadServices);


router.get("/", servicesController.getServicesByStep);

router.get("/by-step", (req, res, next) => {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");
  res.set("Surrogate-Control", "no-store");
  next();
}, servicesController.getServicesByStep);

/* ==========================
   GET SERVICES BY STEP
   /api/services/by-step?step_id=xxxx
========================== */
router.get("/by-step", servicesController.getServicesByStep);

module.exports = router;
