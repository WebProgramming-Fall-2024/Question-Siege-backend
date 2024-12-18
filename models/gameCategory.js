const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const Game = require('./game');
const Category = require('./category');

const GameCategory = sequelize.define('GameCategory', {
    game_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Game,
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
    timestamps: false, // This is just a join table
});

Game.belongsToMany(Category, { through: GameCategory, foreignKey: 'game_id', as: 'Categories' });
Category.belongsToMany(Game, { through: GameCategory, foreignKey: 'category_id', as: 'Games' });

module.exports = GameCategory;
