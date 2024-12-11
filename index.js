const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Import Routes
const designerRoutes = require('./routes/designer');
const playerRoutes = require('./routes/player');

// Use Routes
app.use('/api/designer', designerRoutes);
app.use('/api/player', playerRoutes);

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
