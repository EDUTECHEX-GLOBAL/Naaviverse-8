var express = require("express");
var router = express.Router();

const servicesController = require("../controllers/services.controller");
const { verifyToken } = require("../middlewares/authJwt");

router.post("/add", servicesController.addService);
router.get("/get", servicesController.getServices);
router.put("/update/:id",servicesController.updateService);
// router.put("/complete/:id", stepsController.updateCompletedStep);
router.delete("/delete/:id",  servicesController.deleteService);
router.put("/restore/:id",[verifyToken], servicesController.restoreService);
router.get("/getservices",servicesController.getAllServices);
router.put("/icon/:serviceId", servicesController.updateServiceIcon);

module.exports = router;