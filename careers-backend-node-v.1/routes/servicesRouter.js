const express = require("express");
const router = express.Router();

const ServicesController = require("../controllers/Services.Controller");
/* ==========================
   CREATE SERVICE
========================== */
router.post("/add", ServicesController.addService);

router.get("/getservices", ServicesController.getServices);

router.get("/steps-using/:serviceId", ServicesController.getStepsUsingService);
/* ==========================
   ADMIN: GET ALL SERVICES
========================== */
router.get("/admin", ServicesController.getAllServicesForAdmin);


/* ==========================
   UPDATE SERVICE
========================== */
router.put("/update/:id", ServicesController.updateService);

/* ==========================
   DELETE / RESTORE SERVICE
========================== */
router.delete("/delete/:id", ServicesController.deleteService);
router.put("/restore/:id", ServicesController.restoreService);

/* ==========================
   UPDATE SERVICE ICON
========================== */
router.put("/icon/:serviceId", ServicesController.updateServiceIcon);

/* ==========================
   BULK UPLOAD SERVICES
========================== */
router.post("/bulk", ServicesController.bulkUploadServices);

/* ==========================
   GET SERVICES BY STEP
   /api/services/by-step?step_id=xxxx
========================== */
router.get(
  "/by-step",
  (req, res, next) => {
    res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.set("Pragma", "no-cache");
    res.set("Expires", "0");
    res.set("Surrogate-Control", "no-store");
    next();
  },
  ServicesController.getServicesByStep
);

module.exports = router;
