const express = require('express');
const { createQuestion, getCategories } = require('../controllers/designerController');
const router = express.Router();

router.post('/questions', createQuestion);
router.get('/categories', getCategories);

module.exports = router;
