const express = require('express');
const { getCategoriesWithUserQuestionsCount } = require('../controllers/category-controller');
const auth = require('../middleware/auth'); // Auth middleware to protect the route
const router = express.Router();

// Endpoint to fetch categories with the number of questions designed by the logged-in user
router.get('/', auth, getCategoriesWithUserQuestionsCount);

module.exports = router;
