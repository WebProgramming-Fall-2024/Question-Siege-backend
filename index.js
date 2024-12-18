const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

require('./models/user');
require('./models/follow');
require('./models/question');
require('./models/category');
require('./models/answer');

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Database connection
const { connectDB } = require('./config/db');
connectDB();

// Sync database
const { sequelize } = require('./config/db');
sequelize.sync({ alter: true }) // Syncs models with the database
    .then(() => console.log('Database synced successfully'))
    .catch(err => console.error('Error syncing database:', err));

// Import routes
const designerRoutes = require('./routes/designer');
const questionRoutes = require('./routes/question');
const userRoutes = require('./routes/user');
const categoryRoutes = require('./routes/category');


// Use routes
app.use('/api/designer', designerRoutes); // Designer routes
app.use('/api/questions', questionRoutes); // General question routes
app.use('/api/category', categoryRoutes);
app.use('/api/users', userRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
