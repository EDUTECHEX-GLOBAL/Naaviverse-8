const express = require("express");
const router = express.Router();
const currencyCtrl = require("../controllers/CurrencyController");

router.get("/currencies", currencyCtrl.getAllCurrencies);

module.exports = router;
