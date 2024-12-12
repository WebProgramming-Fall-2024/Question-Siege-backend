require('dotenv').config(); // Load environment variables from .env file
const { Sequelize } = require('sequelize');

// Create a Sequelize instance
const sequelize = new Sequelize(
    process.env.DB_NAME, // Database name
    process.env.DB_USER, // Database username
    process.env.DB_PASSWORD, // Database password
    {
        host: process.env.DB_HOST, // Database host (e.g., localhost)
        dialect: process.env.DB_DIALECT || 'mysql', // Database dialect (default: MySQL)
        logging: false, // Disable Sequelize SQL query logging (optional)
    }
);

// Test the database connection
const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('MySQL Database connected successfully!');
    } catch (error) {
        console.error('Unable to connect to the database:', error.message);
        process.exit(1); // Exit the application if the connection fails
    }
};

module.exports = { sequelize, connectDB };
