const express = require("express");
const router = express.Router();
const vaultCtrl = require("../controllers/vault.controller");

// Add currency
router.post("/coins/add", vaultCtrl.addCurrency);

// Get all currencies for user
router.get("/coins/:email", vaultCtrl.getCurrencies);

module.exports = router;
