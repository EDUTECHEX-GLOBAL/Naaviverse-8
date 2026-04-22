var express = require("express");
var router = express.Router();

const pathController = require("../controllers/paths.controller");
const { verifyToken } = require("../middlewares/authJwt");

// ADD NEW PATH
router.post("/add", pathController.addPath);
router.put("/submit", pathController.submitForApproval);
router.patch("/edit", pathController.editPath);

// GET PATHS (general fetch)
router.get("/get", pathController.getPath);

// GET PATHS (specific criteria)
router.get("/get/specific", pathController.getPathSpecific);

// POST BASED SEARCH
router.post("/get", pathController.getPathNormal);

// DELETE PATH
router.delete("/delete/:id", pathController.deletePath);

// RESTORE PATH (requires token)
router.put("/restore/:id", [verifyToken], pathController.restorePath);

// UPDATE MULTIPLE FIELDS
router.put("/updateFields", pathController.updateFields);

// EDIT PATH
router.put("/update/:id", pathController.updatePath);


// GET ACTIVE PATHS
router.get("/active", pathController.getActivePaths);

//FOR REACTIVATING PATHS
router.put("/reactivate/:id", pathController.reactivatePath);

router.put("/reactivate/:id", pathController.reactivateInactivePath);


// UPDATE PATH STATUS
router.put("/updatepath/:id", pathController.updatePathStatus);

router.put("/requestchanges/:id", pathController.requestChanges);

router.patch("/reply/:pathId/:changeRequestId", pathController.replyToChangeRequest);

router.patch("/address/:pathId/:changeRequestId", pathController.markChangeRequestAddressed);

// ⭐ VIEW PATH BY MONGO ID (IMPORTANT for frontend View Page)
router.get("/viewpath/:path_id", pathController.getPathById);

// BULK UPLOAD PATHS
router.post("/bulk", pathController.uploadBulkPaths);

module.exports = router;
