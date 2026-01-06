var express = require("express");
var router = express.Router();

const pathController = require("../controllers/paths.controller");
const { verifyToken } = require("../middlewares/authJwt");

// PATH CRUD
router.post("/add", pathController.addPath);
router.get("/get", pathController.getPath);
router.get("/get/specific", pathController.getPathSpecific);
router.post("/get", pathController.getPathNormal);
router.delete("/delete/:id", pathController.deletePath);
router.put("/restore/:id", [verifyToken], pathController.restorePath);
router.put("/updateFields", pathController.updateFields);

// ⭐ Used for editing single fields (meta updates)
router.patch("/edit", pathController.updatePath);

// Active paths for admin
router.get("/active", pathController.getActivePaths);

// Approve / Reject path
router.put("/updatepath/:id", pathController.updatePathStatus);

// ⭐ REQUIRED: This route must return full steps inside StepDetails
router.get("/viewpath/:path_id", pathController.getPathById);

module.exports = router;
