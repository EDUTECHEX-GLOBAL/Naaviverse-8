var express = require("express");
var router = express.Router();

const pathController = require("../controllers/paths.controller");
const { verifyToken } = require("../middlewares/authJwt");

router.post("/add", pathController.addPath);
router.get("/get", pathController.getPath);
router.get("/get/specific", pathController.getPathSpecific);
router.post("/get", pathController.getPathNormal);
router.delete("/delete/:id", pathController.deletePath);
router.put("/restore/:id",  [verifyToken], pathController.restorePath);
router.put("/updateFields",  pathController.updateFields);
router.patch("/edit", pathController.updatePath);
router.get("/active",pathController.getActivePaths);
router.put("/updatepath/:id",pathController.updatePathStatus);
router.get("/viewpath/:path_id", pathController.getPathById);

module.exports = router;