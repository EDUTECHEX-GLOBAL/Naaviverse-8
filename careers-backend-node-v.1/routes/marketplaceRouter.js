const express = require("express");
const router = express.Router();

const marketplaceController = require("../controllers/marketplace.controller");

// Check if controller is properly imported
console.log("Marketplace Controller:", marketplaceController);

/* ADD MARKETPLACE ITEM */
router.post("/add", marketplaceController.addMarketplaceItem);

/* GET MARKETPLACE ITEMS (by partner email) */
router.get("/get", marketplaceController.getMarketplaceItems);

/* GET MARKETPLACE ITEMS BY STEP */
router.get("/step/:step_id", marketplaceController.getMarketplaceItemsByStep);

/* GET ALL MARKETPLACE ITEMS FOR ADMIN */
router.get("/admin/get-all", marketplaceController.getAllMarketplaceItems);

module.exports = router;