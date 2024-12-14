const User = require('../models/user');
const { validationResult } = require('express-validator');

exports.signup = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { username, password, phone_number } = req.body;

    try {
        const user = await User.create({ username, password, phone_number });
        res.status(201).json({ message: 'User created successfully', user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

exports.login = async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ where: { username } });

        if (!user) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        // Check if token expiration is set to "never"
        const tokenOptions = {};
        if (process.env.JWT_EXPIRES_IN !== 'never') {
            tokenOptions.expiresIn = process.env.JWT_EXPIRES_IN;
        }

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, tokenOptions);
        res.status(200).json({ message: 'Login successful', token });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
