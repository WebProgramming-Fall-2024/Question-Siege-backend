const Question = require('../models/question');
const Category = require('../models/category');
const { Op } = require('sequelize');

// Create a basic question (initial version)
exports.createBasicQuestion = async (req, res) => {
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


exports.getQuestionsByCategory = async (req, res) => {
    try {
        const { category } = req.query;
        const userId = req.user.id; // Get the logged-in user's ID from JWT middleware

        if (!category) {
            return res.status(400).json({ error: "Category name is required" });
        }

        // Find the category by name
        const categoryRecord = await Category.findOne({
            where: { name: { [Op.like]: `%${category}%` } },
        });

        if (!categoryRecord) {
            return res.status(404).json({ error: "Category not found" });
        }

        // Fetch questions created by the logged-in user in the specified category
        const questions = await Question.findAll({
            where: {
                category_id: categoryRecord.id,
                creator_id: userId,
            },
            attributes: ['id', 'text', 'difficulty', 'correctAnswer', 'options'], // Include necessary fields
            order: [['id', 'ASC']],
        });

        // Transform the data to match the frontend's expected format
        const formattedQuestions = questions.map((q) => ({
            id: q.id,
            text: q.text,
            difficulty: q.difficulty,
            correctAnswer: q.correctAnswer,
            options: q.options, // Options are stored as JSON
        }));

        return res.status(200).json(formattedQuestions);
    } catch (error) {
        console.error("Error fetching questions:", error);
        return res.status(500).json({ error: "Error fetching questions" });
    }
};


// Controller function for adding a new question
exports.createQuestion = async (req, res) => {
    try {
        const { title, difficulty, correctAnswer, options, category } = req.body;
        const userId = req.user.id; // Logged-in user's ID (from JWT)

        // Validate input
        if (!title || !difficulty || !correctAnswer || !options || !category) {
            return res.status(400).json({ error: "All fields are required" });
        }

        // Parse options if it’s a string
        let fixedOptions;
        if (typeof options === "string") {
            try {
                fixedOptions = JSON.parse(options);
            } catch (err) {
                return res.status(400).json({ error: "Options must be a valid JSON array" });
            }
        } else {
            fixedOptions = options;
        }

        // Validate options length
        if (!Array.isArray(fixedOptions) || fixedOptions.length !== 4) {
            return res.status(400).json({ error: "Options must be an array of 4 items" });
        }

        // Check if the category exists
        const categoryRecord = await Category.findOne({
            where: { name: { [Op.like]: `%${category}%` } },
        });

        if (!categoryRecord) {
            return res.status(404).json({ error: "Category not found" });
        }

        // Save options directly as a JSON array without stringifying
        const newQuestion = await Question.create({
            text: title,
            difficulty: difficulty.toLowerCase(),
            correctAnswer,
            options: fixedOptions, // Save as JSON directly
            creator_id: userId,
            category_id: categoryRecord.id,
        });

        return res.status(201).json({
            message: "Question created successfully",
            question: {
                id: newQuestion.id,
                text: newQuestion.text,
                difficulty: newQuestion.difficulty,
                correctAnswer: newQuestion.correctAnswer,
                options: newQuestion.options, // Already a JSON array
                category: categoryRecord.name,
            },
        });
    } catch (error) {
        console.error("Error creating question:", error);
        return res.status(500).json({ error: "Server error while creating question" });
    }
};

