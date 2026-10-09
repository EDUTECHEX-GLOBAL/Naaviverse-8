const express = require("express");
const router = express.Router();
const {
  createPathRequest,
  getMyPathRequests,
  getAllPathRequests,
  getPathRequestById,
  updatePathRequestStatus,
  createPathFromRequest,
  deletePathRequest,
} = require("../controllers/PathRequestController");

// User routes
router.post("/create", createPathRequest);
router.get("/my-requests", getMyPathRequests);

// Super Admin / Management routes
router.get("/all", getAllPathRequests);
router.get("/:id", getPathRequestById);
router.put("/:id/status", updatePathRequestStatus);
router.patch("/:id/status", updatePathRequestStatus);
router.post("/:id/create-path", createPathFromRequest);
router.delete("/:id", deletePathRequest);

module.exports = router;
