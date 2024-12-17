const express = require('express');
const { signup, login, getUserProfile, getAllUsers, getUserDetailsByName, getUsersSortedByScore} = require('../controllers/user-controller');
const { validateSignup, validateLogin } = require('../middleware/validation');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

router.get('/', authMiddleware, getAllUsers);
router.post('/signup', validateSignup, signup);
router.post('/login', validateLogin, login);
router.get('/profile', authMiddleware, getUserProfile);
router.get('/profile/details', authMiddleware, getUserDetailsByName);
router.get('/sorted-by-score', authMiddleware, getUsersSortedByScore);

module.exports = router;
