const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const notificationRoutes = require('./routes/notificationRoutes');

dotenv.config();

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/notify/bid', notificationRoutes);

app.get('/', (req, res) => {
    res.send('Notification Service is running...');
});

const PORT = process.env.PORT || 3501;

app.listen(PORT, console.log(`Notification Server running on port ${PORT}`));
