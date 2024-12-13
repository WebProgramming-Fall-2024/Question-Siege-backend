// Import necessary modules
const User = require('../models/user'); // Assuming you have a User model

// Controller object
const userController = {
    // Signup function
    async signup(req, res) {
        try {
            const { username, password, phone_number } = req.body;

            // Check if the user already exists
            const existingUser = await User.findOne({ where: { username } });
            if (existingUser) {
                return res.status(400).json({ message: 'User already exists' });
            }

            // Create a new user
            const newUser = await User.create({
                username,
                password,
                phone_number,
            });

            res.status(201).json({ message: 'User created successfully', user: newUser });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },

    // Login function
    async login(req, res) {
        try {
            const { username, password } = req.body;

            // Find the user by username
            const user = await User.findOne({ where: { username } });
            if (!user) {
                return res.status(400).json({ message: 'Invalid username or password' });
            }

            // Check the password
            if (user.password !== password) {
                return res.status(400).json({ message: 'Invalid username or password' });
            }

            res.status(200).json({
                message: 'Login successful',
                user: {
                    id: user.id,
                    username: user.username,
                    phone_number: user.phone_number,
                    signupDate: user.signupDate,
                    lastOnline: user.lastOnline,
                    score: user.score,
                },
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },
};

module.exports = userController;
