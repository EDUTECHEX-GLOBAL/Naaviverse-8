const express = require("express");
const router = express.Router();

const marketplaceController = require("../controllers/marketplace.controller");

router.post("/add", marketplaceController.addMarketplaceItem);

router.get("/step/:step_id", marketplaceController.getMarketplaceItemsByStep);

router.get("/admin/get-all", marketplaceController.getAllMarketplaceItems);

// Single route for linking/unlinking a marketplace item to/from a step
router.patch("/link-step", marketplaceController.linkMarketplaceToStep);

module.exports = router;