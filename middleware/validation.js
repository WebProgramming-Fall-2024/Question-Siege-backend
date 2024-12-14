const { body } = require('express-validator');

const validateSignup = [
    body('username').isString().notEmpty().withMessage('Username is required'),
    body('password').isString().isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('phone_number').isString().notEmpty().withMessage('Phone number is required'),
];

const validateLogin = [
    body('username').isString().notEmpty().withMessage('Username is required'),
    body('password').isString().notEmpty().withMessage('Password is required'),
];

module.exports = { validateSignup, validateLogin };
