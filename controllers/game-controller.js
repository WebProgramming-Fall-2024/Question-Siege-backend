const Question = require("../models/question");
const Category = require("../models/category");
const { sequelize } = require("../config/db");
const { Op } = require("sequelize");

// Game State - Temporary Storage
const gameSessions = {};

// Start a new game
exports.startGame = async (req, res) => {
    try {
        const { category } = req.body;
        const userId = req.user.id;

        if (!category) {
            return res.status(400).json({ error: "Category is required." });
        }

        // Fetch questions based on category
        let questions;
        if (category === "random") {
            questions = await Question.findAll({
                where: { creator_id: { [Op.ne]: userId } },
                attributes: ["id", "text", "options", "correctAnswer"],
                order: [[sequelize.fn("RAND")]], // Fetch random questions
                limit: 10,
            });
        } else {
            const categoryRecord = await Category.findOne({
                where: { name: { [Op.like]: `%${category}%` } },
            });

            if (!categoryRecord) {
                return res.status(404).json({ error: "Category not found." });
            }

            questions = await Question.findAll({
                where: { 
                    category_id: categoryRecord.id,
                    creator_id: { [Op.ne]: userId },
                },
                attributes: ["id", "text", "options", "correctAnswer"],
                order: [["id", "ASC"]],
                limit: 10,
            });
        }

        if (!questions.length) {
            return res.status(404).json({ error: "No questions available for this category." });
        }

        // Split options and initialize game session
        const sessionId = userId; // Use user ID as session ID
        gameSessions[sessionId] = {
            questions: questions.map((q) => ({
                id: q.id,
                text: q.text,
                options: Array.isArray(q.options) ? q.options : q.options.split(","),
                correctAnswer: q.correctAnswer,
            })),
            currentQuestionIndex: 0,
            score: 0,
        };

        const firstQuestion = gameSessions[sessionId].questions[0];

        res.status(200).json({
            question: firstQuestion.text,
            options: firstQuestion.options, // Properly split options
        });
    } catch (error) {
        console.error("Error starting game:", error);
        res.status(500).json({ error: "Server error while starting the game." });
    }
};

// Submit an answer
exports.submitAnswer = async (req, res) => {
    try {
        const { answer } = req.body;
        const userId = req.user.id;
        const sessionId = userId;

        // Validate session
        if (!gameSessions[sessionId]) {
            return res.status(400).json({ error: "No active game session found." });
        }

        const currentGame = gameSessions[sessionId];
        const currentQuestion =
            currentGame.questions[currentGame.currentQuestionIndex];

        // Check answer correctness
        if (answer === currentQuestion.correctAnswer) {
            currentGame.score += 10; // Example scoring logic
        }

        currentGame.currentQuestionIndex += 1;

        // Check if there are more questions
        if (currentGame.currentQuestionIndex < currentGame.questions.length) {
            const nextQuestion =
                currentGame.questions[currentGame.currentQuestionIndex];
            return res.status(200).json({
                nextQuestion: nextQuestion.text,
                options: nextQuestion.options,
            });
        } else {
            // Game finished
            const finalScore = currentGame.score;
            delete gameSessions[sessionId]; // Clean up session

            return res.status(200).json({
                results: {
                    message: "Game over!",
                    score: finalScore,
                },
            });
        }
    } catch (error) {
        console.error("Error submitting answer:", error);
        res.status(500).json({ error: "Server error while submitting answer." });
    }
};
