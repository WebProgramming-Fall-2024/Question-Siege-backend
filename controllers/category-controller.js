const { sequelize } = require('../config/db');
const Category = require('../models/category');
const Question = require('../models/question');

// Fetch categories with the number of questions designed by the logged-in user
exports.getCategoriesWithUserQuestionsCount = async (req, res) => {
    try {
        const userId = req.user.id; // Extract logged-in user ID from JWT token (auth middleware)

        // Fetch categories and count the questions designed by the user in each category
        const categories = await Category.findAll({
            attributes: ['id', 'name', 'description'],
            include: [
                {
                    model: Question,
                    as: 'Questions',
                    attributes: [], // We don't need full question details here
                    where: { creator_id: userId },
                    required: false, // Include categories even if no questions exist for the user
                },
            ],
            group: ['Category.id'], // Group by category ID to aggregate counts
            attributes: {
                include: [
                    [
                        // Count of questions designed by the user in each category
                        sequelize.fn('COUNT', sequelize.col('Questions.id')),
                        'userQuestionsCount',
                    ],
                ],
            },
        });

        return res.status(200).json(categories);
    } catch (err) {
        console.error('Error fetching categories:', err);
        return res.status(500).json({ error: 'Failed to fetch categories' });
    }
};
