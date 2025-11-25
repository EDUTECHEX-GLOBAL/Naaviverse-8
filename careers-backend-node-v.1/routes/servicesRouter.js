const express = require("express");
const router = express.Router();

const servicesController = require("../controllers/services.controller");
const { verifyToken } = require("../middlewares/authJwt");

router.post("/add", servicesController.addService);
router.get("/get", servicesController.getServices);
router.put("/update/:id", servicesController.updateService);
router.delete("/delete/:id", servicesController.deleteService);
router.put("/restore/:id", [verifyToken], servicesController.restoreService);
router.get("/getservices", servicesController.getAllServices);
router.put("/icon/:serviceId", servicesController.updateServiceIcon);

// ✅ this must reference a defined export
router.get("/by-step", (req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  res.set('Surrogate-Control', 'no-store');
  next();
}, servicesController.getServicesByStep);


module.exports = router;
