const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./user');

const Follow = sequelize.define('Follow', {
    follower_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id',
        },
    },
    followee_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id',
        },
    },
}, {
    timestamps: false,
});

// Define associations
User.belongsToMany(User, {
    through: Follow,
    as: 'UsersFollowed', // Renamed alias
    foreignKey: 'follower_id',
    otherKey: 'followee_id',
});
User.belongsToMany(User, {
    through: Follow,
    as: 'UserFollowers', // Renamed alias
    foreignKey: 'followee_id',
    otherKey: 'follower_id',
});

module.exports = Follow;
