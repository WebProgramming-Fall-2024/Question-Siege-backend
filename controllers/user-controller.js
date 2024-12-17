const User = require('../models/user');
const { validationResult } = require('express-validator');
const Answer = require('../models/answer');
const Question = require('../models/question');
const { Op } = require('sequelize'); // For query conditions
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

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



// Fetch user profile and last 10 games
exports.getUserProfile = async (req, res) => {
    try {
        const userId = req.user.id; // Extract user ID from the token (assumes JWT middleware)

        // Fetch user information
        const user = await User.findByPk(userId, {
            attributes: ['username', 'score', 'signupDate'],
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Fetch number of designed and answered questions
        const designedCount = await Question.count({ where: { creator_id: userId } });
        const answeredCount = await Answer.count({ where: { user_id: userId } });

        // Fetch last 10 games (answers by the user, with questions)
        const lastGames = await Answer.findAll({
            where: { user_id: userId },
            include: [
                {
                    model: Question,
                    as: 'AnswerQuestion',
                    attributes: ['text', 'creator_id'],
                },
            ],
            order: [['answeredAt', 'DESC']],
            limit: 10,
        });

        // Build response
        const profileData = {
            username: user.username,
            score: user.score,
            signupDate: user.signupDate,
            designedQuestions: designedCount,
            answeredQuestions: answeredCount,
            lastGames: lastGames.map((game) => ({
                question: game.AnswerQuestion.text,
                status: game.isCorrect ? 'correct' : 'incorrect',
                score: game.isCorrect ? 2 : 0, // Example scoring logic
            })),
        };

        return res.status(200).json(profileData);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Something went wrong' });
    }
};
