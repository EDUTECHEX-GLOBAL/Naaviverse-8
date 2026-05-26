const express = require('express');
const router = express.Router();
const stateController = require('../controllers/State.Controller');

router.get('/', stateController.getStates);
router.post('/', stateController.createState);

module.exports = router;
