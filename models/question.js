const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const Category = require('./category');
const User = require('./user');

const Question = sequelize.define('Question', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    text: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    difficulty: {
        type: DataTypes.ENUM('easy', 'medium', 'hard'),
        allowNull: false,
    },
    correctAnswer: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    options: {
        type: DataTypes.JSON,
        allowNull: false,
    },
    creator_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id',
        },
    },
    category_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Category,
            key: 'id',
        },
    },
}, {
    timestamps: false,
});

// Define associations
Category.hasMany(Question, { foreignKey: 'category_id', as: 'Questions' });
Question.belongsTo(Category, { foreignKey: 'category_id', as: 'Category' });

User.hasMany(Question, { foreignKey: 'creator_id', as: 'CreatedQuestions' });
Question.belongsTo(User, { foreignKey: 'creator_id', as: 'Creator' });

module.exports = Question;
