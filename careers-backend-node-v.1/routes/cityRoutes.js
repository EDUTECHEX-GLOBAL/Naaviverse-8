const express = require('express');
const router = express.Router();
const CityController = require('../controllers/City.Controller'); // ← capitalize to match usage

router.get('/', CityController.getCities);
router.post('/', CityController.createCity);

module.exports = router;