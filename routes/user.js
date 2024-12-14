const express = require('express');
const { signup, login } = require('../controllers/user-controller');
const { validateSignup, validateLogin } = require('../middleware/validation'); // Import validations
const router = express.Router();

router.post('/signup', validateSignup, signup);
router.post('/login', validateLogin, login);

module.exports = router;
