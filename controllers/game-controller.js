const Game = require('../models/game');
const GameCategory = require('../models/gameCategory');
const Question = require('../models/question');
const Answer = require('../models/answer');
const User = require('../models/user');
const { sequelize } = require('../config/db');
const { Op } = require('sequelize');

// Start a new game session
exports.startGame = async (req, res) => {
    const { categoryIds = [], mode } = req.body; // categoryIds is an array of category IDs
    const userId = req.user.id;

    try {
        // Create a new game session
        const game = await Game.create({
            user_id: userId,
        });

        // Associate selected categories with the game
        if (categoryIds.length > 0) {
            const gameCategories = categoryIds.map((categoryId) => ({
                game_id: game.id,
                category_id: categoryId,
            }));
            await GameCategory.bulkCreate(gameCategories);
        }

        // Fetch the first question
        const questionFilter = categoryIds.length > 0
            ? { category_id: { [Op.in]: categoryIds } }
            : {}; // If no categories, fetch from all questions

        const question = await Question.findOne({
            where: questionFilter,
            order: sequelize.random(),
        });

        if (!question) {
            return res.status(404).json({ error: 'No questions available for the selected mode or categories.' });
        }

        res.status(201).json({
            gameId: game.id,
            question,
        });
    } catch (err) {
        console.error('Error starting game:', err);
        res.status(500).json({ error: 'Failed to start the game session.' });
    }
};

// Submit an answer for the current game
exports.submitAnswer = async (req, res) => {
    const { gameId, questionId, answer } = req.body;
    const userId = req.user.id;

    try {
        // Validate the game session
        const game = await Game.findOne({ where: { id: gameId, user_id: userId, isActive: true } });
        if (!game) {
            return res.status(400).json({ error: 'Invalid or inactive game session.' });
        }

        // Validate the question
        const question = await Question.findByPk(questionId);
        if (!question) {
            return res.status(400).json({ error: 'Invalid question.' });
        }

        // Check if the answer is correct
        const isCorrect = question.correctAnswer === answer;

        // Update the game session score
        game.score += isCorrect ? 2 : 0; // Example: 2 points for correct, 0 for incorrect
        await game.save();

        // Save the answer
        await Answer.create({
            game_id: gameId,
            question_id: questionId,
            user_id: userId,
            answer,
            isCorrect,
        });

        // Fetch the next question
        const categoryIds = await GameCategory.findAll({
            where: { game_id: gameId },
            attributes: ['category_id'],
        }).then((categories) => categories.map((cat) => cat.category_id));

        const nextQuestionFilter = categoryIds.length > 0
            ? { category_id: { [Op.in]: categoryIds }, id: { [Op.not]: questionId } }
            : { id: { [Op.not]: questionId } };

        const nextQuestion = await Question.findOne({
            where: nextQuestionFilter,
            order: sequelize.random(),
        });

        if (!nextQuestion) {
            // No more questions, end the game session
            game.isActive = false;
            await game.save();

            return res.status(200).json({
                message: 'Game over!',
                finalScore: game.score,
            });
        }

        res.status(200).json({
            isCorrect,
            nextQuestion,
            currentScore: game.score,
        });
    } catch (err) {
        console.error('Error submitting answer:', err);
        res.status(500).json({ error: 'Failed to submit answer.' });
    }
};

// End the game session
exports.endGame = async (req, res) => {
    const { gameId } = req.body;
    const userId = req.user.id;

    try {
        // Validate the game session
        const game = await Game.findOne({ where: { id: gameId, user_id: userId, isActive: true } });

        if (!game) {
            return res.status(400).json({ error: 'Invalid or already ended game session.' });
        }

        // Mark the game as inactive
        game.isActive = false;
        await game.save();

        // Update the user's total score
        const user = await User.findByPk(userId);
        user.score += game.score;
        await user.save();

        res.status(200).json({
            message: 'Game ended successfully.',
            finalScore: game.score,
            totalScore: user.score,
        });
    } catch (err) {
        console.error('Error ending game:', err);
        res.status(500).json({ error: 'Failed to end the game session.' });
    }
};
