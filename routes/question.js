const express = require('express');
const { createQuestion, getQuestions } = require('../controllers/question-controller');
const router = express.Router();

// General question-related routes
router.post('/', createQuestion); // Create a question
router.get('/', getQuestions); // Fetch all questions

module.exports = router;
