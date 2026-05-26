var express = require("express");
var router = express.Router();

const PathController = require("../controllers/Paths.Controller");
const { verifyToken } = require("../middlewares/authJwt");

// ADD NEW PATH
router.post("/add", PathController.addPath);
router.put("/submit", PathController.submitForApproval);
router.patch("/edit", PathController.editPath);

// GET PATHS (general fetch)
router.get("/get", PathController.getPath);

// GET PATHS (specific criteria)
router.get("/get/specific", PathController.getPathSpecific);

// POST BASED SEARCH
router.post("/get", PathController.getPathNormal);

// DELETE PATH
router.delete("/delete/:id", PathController.deletePath);

// RESTORE PATH (requires token)
router.put("/restore/:id", [verifyToken], PathController.restorePath);

// UPDATE MULTIPLE FIELDS
router.put("/updateFields", PathController.updateFields);

// EDIT PATH
router.put("/update/:id", PathController.updatePath);


// GET ACTIVE PATHS
router.get("/active", PathController.getActivePaths);

//FOR REACTIVATING PATHS
router.put("/reactivate/:id", PathController.reactivatePath);

router.put("/reactivate/:id", PathController.reactivateInactivePath);


// UPDATE PATH STATUS
router.put("/updatepath/:id", PathController.updatePathStatus);

router.put("/requestchanges/:id", PathController.requestChanges);

router.patch("/reply/:pathId/:changeRequestId", PathController.replyToChangeRequest);

router.patch("/address/:pathId/:changeRequestId", PathController.markChangeRequestAddressed);

// ⭐ VIEW PATH BY MONGO ID (IMPORTANT for frontend View Page)
router.get("/viewpath/:path_id", PathController.getPathById);

// BULK UPLOAD PATHS
router.post("/bulk", PathController.uploadBulkPaths);

module.exports = router;
