const express = require("express");
const router = express.Router();
const approvalController = require("../controllers/approval.controller");


router.post("/create", approvalController.createApproval);

// GET all approvals (admin)
router.get("/get", approvalController.getApprovals);

// ✅ NEW: GET approval status by email
// Usage: GET /api/approval/status?email=xxx@gmail.com
router.get("/status", approvalController.getApprovalByEmail);

// UPDATE approval status by id
router.put("/update/:id", approvalController.updateApproval);
//exports 
module.exports = router;