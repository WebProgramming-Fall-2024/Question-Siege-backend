const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Database connection
const { connectDB } = require('./config/db');
connectDB();

// Sync models
const { sequelize } = require('./config/db');
sequelize.sync({ force: false }) // Set to 'true' to reset tables during development
    .then(() => console.log('Database synced'))
    .catch(err => console.log(err));

// Import routes
const designerRoutes = require('./routes/designer');
const questionRoutes = require('./routes/question');

// Use routes
app.use('/api/designer', designerRoutes); // Designer routes
app.use('/api/questions', questionRoutes); // General question routes

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
