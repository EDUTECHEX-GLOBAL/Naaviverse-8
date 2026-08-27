const express = require("express");
const router = express.Router();

const MarketPlaceController = require("../controllers/MarketPlaceController");
const MarketplaceReplacementController = require("../controllers/MarketplaceReplacementController");

// ── Core Marketplace ──
router.post("/add", MarketPlaceController.addMarketplaceItem);
router.get("/rankings", MarketPlaceController.getMarketplaceRankings);
router.post("/analytics", MarketPlaceController.updateMarketplaceAnalytics);
router.post("/recalculate", MarketPlaceController.recalculateMarketplaceRankings);
router.get("/step/:step_id", MarketPlaceController.getMarketplaceItemsByStep);

router.get("/admin/get-all", MarketPlaceController.getAllMarketplaceItems);
router.get("/admin/score-breakdown/:id", MarketPlaceController.getMarketplaceItemScoreBreakdown);
router.get("/accountant/get-all", MarketPlaceController.getAllMarketplaceItems);

// ── Marketplace Replacement Flow (User) ──
router.post("/replacement", MarketplaceReplacementController.submitReplacement);
router.get("/replacement/:stepId", MarketplaceReplacementController.getReplacementHistory);

// ── Super Admin Assistance (Admin & User side) ──
router.post("/assistance", MarketplaceReplacementController.createAssistanceRequest);
router.get("/assistance/user", MarketplaceReplacementController.getUserAssistanceRequests);
router.get("/assistance/:requestId/messages", MarketplaceReplacementController.getMessages);
router.post("/assistance/:requestId/message", MarketplaceReplacementController.sendMessage);

// Handles both app.use("/api/admin/marketplace") -> /assistance and app.use("/api/marketplace") -> /admin/assistance
router.get("/assistance", MarketplaceReplacementController.getAllAssistanceRequests);
router.get("/admin/assistance", MarketplaceReplacementController.getAllAssistanceRequests);

router.get("/assistance/:requestId", MarketplaceReplacementController.getAssistanceRequestById);
router.get("/admin/assistance/:requestId", MarketplaceReplacementController.getAssistanceRequestById);

router.patch("/assistance/:requestId/status", MarketplaceReplacementController.updateAssistanceStatus);
router.patch("/admin/assistance/:requestId/status", MarketplaceReplacementController.updateAssistanceStatus);

router.post("/assistance/:requestId/recommend", MarketplaceReplacementController.recommendService);
router.post("/admin/assistance/:requestId/recommend", MarketplaceReplacementController.recommendService);

// ── Step linking & item lookup ──
router.patch("/link-step", MarketPlaceController.linkMarketplaceToStep);
router.put("/admin/update/:id", MarketPlaceController.updateMarketplaceItem);
router.get("/:id", MarketPlaceController.getMarketplaceItemById);
router.get("/purchases", MarketPlaceController.getAllPurchases);
router.get("/partner/:partnerId", MarketPlaceController.getMarketplaceByPartnerId);

module.exports = router;
