const express = require('express');
const { signup, login, getUserProfile } = require('../controllers/user-controller');
const { validateSignup, validateLogin } = require('../middleware/validation');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

router.post('/signup', validateSignup, signup);
router.post('/login', validateLogin, login);
router.get('/profile', authMiddleware, getUserProfile);

module.exports = router;
