const express = require('express');
const router = express.Router();
const CountryController = require('../controllers/Country.Controller');

router.get('/', CountryController.getCountries);
router.post('/', CountryController.createCountry);

module.exports = router;
