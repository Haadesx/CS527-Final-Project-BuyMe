const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const auctionRoutes = require('./routes/auctionRoutes');
const itemRoutes = require('./routes/itemRoutes');
const bidRoutes = require('./routes/bidRoutes');

dotenv.config();

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', userRoutes);
app.use('/api/auction', auctionRoutes);
app.use('/api/item', itemRoutes);
app.use('/api/bid', bidRoutes);
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/question', require('./routes/questionRoutes'));

app.get('/', (req, res) => {
    res.send('API is running...');
});

const PORT = process.env.PORT || 3500;

app.listen(PORT, console.log(`Server running on port ${PORT}`));
