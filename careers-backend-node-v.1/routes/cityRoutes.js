const express = require('express');
const router = express.Router();
const cityController = require('../controllers/City.Controller');

router.get('/', CityController.getCities);
router.post('/', CityController.createCity);

module.exports = router;