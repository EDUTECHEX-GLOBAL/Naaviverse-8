// routes/personalityQuestions.routes.js
const express = require('express');
const router = express.Router();
const { getQuestions } = require('../controllers/PersonalityQues.Controller');

// Route to get all active questions
router.get('/questions', getQuestions);

module.exports = router;
