const express = require('express');
const router = express.Router();
const countryController = require('../controllers/Country.Controller');

router.get('/', CountryController.getCountries);
router.post('/', CountryController.createCountry);

module.exports = router;
