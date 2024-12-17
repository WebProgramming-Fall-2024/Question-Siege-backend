const User = require('../models/user');
const { validationResult } = require('express-validator');
const Answer = require('../models/answer');
const Question = require('../models/question');
const Category = require('../models/category');
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

// Fetch all users with designed questions count and scores
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: ['id', 'username', 'signupDate', 'score'],
            include: [
                {
                    model: Question,
                    as: 'CreatedQuestions',
                    attributes: [], // We only need the count
                },
            ],
            group: ['User.id'], // Group by user to aggregate correctly
            raw: true,
        });

        const formattedUsers = users.map(user => ({
            id: user.id,
            username: user.username,
            signupDate: user.signupDate,
            designedQuestions: user['CreatedQuestions.id'] ? user['CreatedQuestions.id'].length : 0,
            score: user.score,
        }));

        res.status(200).json(formattedUsers);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};


exports.getUserDetailsByName = async (req, res) => {
    const { name } = req.query;

    try {
        // Fetch user by username
        const user = await User.findOne({
            where: { username: name },
            attributes: ['id', 'username', 'score', 'signupDate'],
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Fetch designed questions
        const designedQuestions = await Question.findAll({
            where: { creator_id: user.id },
            attributes: ['id', 'text', 'difficulty', 'category_id'],
            include: [
                {
                    model: Category,
                    as: 'Category',
                    attributes: ['name'],
                },
            ],
        });

        // Fetch answered questions (last 10 games)
        const answeredGames = await Answer.findAll({
            where: { user_id: user.id },
            attributes: ['isCorrect', 'answeredAt'],
            include: [
                {
                    model: Question,
                    as: 'AnswerQuestion',
                    attributes: ['text', 'creator_id'], // Explicitly include 'creator_id'
                },
            ],
            order: [['answeredAt', 'DESC']],
            limit: 10,
        });

        // Build the response
        const response = {
            username: user.username,
            answeredQuestions: answeredGames.length,
            score: user.score,
            designedQuestions: designedQuestions.length,
            games: answeredGames.map((game) => ({
                title: game.AnswerQuestion.text,
                designer: game.AnswerQuestion.creator_id,
                status: game.isCorrect ? 'correct' : 'incorrect',
                score: game.isCorrect ? 2 : 0, // Example scoring logic
            })),
            questions: designedQuestions.map((question) => ({
                title: question.text,
                category: question.Category.name,
                tag: question.difficulty,
                date: new Date().toISOString().split('T')[0],
            })),
        };

        return res.status(200).json(response);
    } catch (err) {
        console.error('Error fetching user details:', err);
        return res.status(500).json({ error: 'Server error while fetching user details' });
    }
};


// Fetch all users sorted by score with additional data
exports.getUsersSortedByScore = async (req, res) => {
    try {
        // Fetch all users with their scores, number of designed and answered questions
        const users = await User.findAll({
            attributes: ['id', 'username', 'score'], // Select required user fields
            order: [['score', 'DESC']], // Sort users by score in descending order
        });

        // Map through users and calculate designed and answered question counts
        const userData = await Promise.all(
            users.map(async (user) => {
                const designedQuestionsCount = await Question.count({
                    where: { creator_id: user.id },
                });

                const answeredQuestionsCount = await Answer.count({
                    where: { user_id: user.id },
                });

                return {
                    username: user.username,
                    score: user.score,
                    designedQuestions: designedQuestionsCount,
                    answeredQuestions: answeredQuestionsCount,
                };
            })
        );

        // Respond with the sorted user data
        return res.status(200).json(userData);
    } catch (err) {
        console.error('Error fetching sorted users:', err);
        return res.status(500).json({ error: 'Server error while fetching sorted users' });
    }
};