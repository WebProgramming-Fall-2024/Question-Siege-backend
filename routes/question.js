const express = require('express');
const { createQuestion, getQuestions } = require('../controllers/question-controller');
const router = express.Router();

// General question-related routes
router.post('/questions', createQuestion); // Create a question
router.get('/questions', getQuestions); // Fetch all questions

module.exports = router;
