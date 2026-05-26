const express = require("express");
const router = express.Router();
const ApprovalController = require("../controllers/ApprovalController");

router.post("/create", ApprovalController.createApproval);

// GET all approvals (admin)
router.get("/get", ApprovalController.getApprovals);

// ✅ NEW: GET approval status by email
// Usage: GET /api/approval/status?email=xxx@gmail.com
router.get("/status", ApprovalController.getApprovalByEmail);

// UPDATE approval status by id
router.put("/update/:id", ApprovalController.updateApproval);
//exports 
module.exports = router;