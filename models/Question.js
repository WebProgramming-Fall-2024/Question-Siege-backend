const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

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
    category: {
        type: DataTypes.STRING,
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
});

module.exports = Question;
