const express = require('express');
const { createBasicQuestion, createQuestion, getQuestions, getQuestionsByCategory } = require('../controllers/question-controller');
const auth = require('../middleware/auth'); // Ensure the user is authenticated
const router = express.Router();

// General question-related routes
router.post('/', createBasicQuestion); // Create a question
router.post('/create', auth, createQuestion);
router.get('/', auth, (req, res) => {
    if (req.query.category) {
        // If category is present in the query, fetch questions by category
        return getQuestionsByCategory(req, res);
    } else {
        // Otherwise, fetch all questions
        return getQuestions(req, res);
    }
});

module.exports = router;
