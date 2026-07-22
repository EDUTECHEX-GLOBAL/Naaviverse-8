const express = require("express");
const router = express.Router();

const MarketPlaceController = require("../controllers/MarketPlaceController");

router.post("/add", MarketPlaceController.addMarketplaceItem);

router.get("/rankings", MarketPlaceController.getMarketplaceRankings);

router.post("/analytics", MarketPlaceController.updateMarketplaceAnalytics);

router.post("/recalculate", MarketPlaceController.recalculateMarketplaceRankings);

router.get("/step/:step_id", MarketPlaceController.getMarketplaceItemsByStep);

router.get("/admin/get-all", MarketPlaceController.getAllMarketplaceItems);
router.get("/accountant/get-all", MarketPlaceController.getAllMarketplaceItems);

// Single route for linking/unlinking a marketplace item to/from a step
router.patch("/link-step", MarketPlaceController.linkMarketplaceToStep);
router.put("/admin/update/:id", MarketPlaceController.updateMarketplaceItem);
router.get("/:id", MarketPlaceController.getMarketplaceItemById);
router.get("/purchases", MarketPlaceController.getAllPurchases);
router.get("/partner/:partnerId", MarketPlaceController.getMarketplaceByPartnerId);
module.exports = router;
