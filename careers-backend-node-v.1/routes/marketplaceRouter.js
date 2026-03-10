const express = require("express");
const router = express.Router();

const marketplaceController = require("../controllers/marketplace.controller");

/* ADD MARKETPLACE ITEM */
router.post("/add", marketplaceController.addMarketplaceItem);

/* GET MARKETPLACE ITEMS */
router.get("/get", marketplaceController.getMarketplaceItems);

/* GET MARKETPLACE ITEMS BY STEP */
router.get("/step/:step_id", marketplaceController.getMarketplaceItemsByStep);

module.exports = router;