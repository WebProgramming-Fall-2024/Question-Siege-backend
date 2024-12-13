const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./user');
const Question = require('./question');

const Answer = sequelize.define('Answer', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    question_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Question,
            key: 'id',
        },
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id',
        },
    },
    answer: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    isCorrect: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
    },
    answeredAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
}, {
    timestamps: false,
});

// Define associations
User.hasMany(Answer, { foreignKey: 'user_id', as: 'UserAnswers' });
Answer.belongsTo(User, { foreignKey: 'user_id', as: 'AnsweringUser' });

Question.hasMany(Answer, { foreignKey: 'question_id', as: 'QuestionAnswers' });
Answer.belongsTo(Question, { foreignKey: 'question_id', as: 'AnswerQuestion' });

module.exports = Answer;
