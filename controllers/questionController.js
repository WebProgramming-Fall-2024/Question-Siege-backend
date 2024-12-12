const Question = require('../models/Question');

// Create a question
exports.createQuestion = async (req, res) => {
    const { text, difficulty, category, correctAnswer, options } = req.body;

    try {
        const question = await Question.create({ text, difficulty, category, correctAnswer, options });
        res.status(201).json(question);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Fetch all questions
exports.getQuestions = async (req, res) => {
    try {
        const questions = await Question.findAll();
        res.status(200).json(questions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
