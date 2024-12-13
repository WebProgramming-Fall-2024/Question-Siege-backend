const express = require('express');
const userController = require('../controllers/user-controller');

const router = express.Router();

// Route for user signup
router.post('/signup', userController.signup);

// Route for user login
router.post('/login', userController.login);

module.exports = router;