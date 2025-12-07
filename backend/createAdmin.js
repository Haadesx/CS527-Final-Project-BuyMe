const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const createAdmin = async () => {
    try {
        const adminExists = await User.findOne({ email: 'admin@buyme.com' });
        if (adminExists) {
            console.log('Admin already exists');
            process.exit();
        }

        const user = await User.create({
            first_name: 'Admin',
            last_name: 'User',
            username: 'Administrator',
            email: 'admin@buyme.com',
            password: 'password123',
            role: 'admin',
            phone: '1234567890',
            countrycode: '+1'
        });

        console.log('Admin created successfully');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

createAdmin();
