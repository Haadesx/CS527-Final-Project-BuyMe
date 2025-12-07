const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
        expiresIn: '30d',
    });
};

const authUser = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        res.json({
            data: generateToken(user._id),
            _id: user._id,
            username: user.username,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            role: user.role,
        });
    } else {
        res.status(401).json({ message: 'Invalid email or password' });
    }
};

const registerUser = async (req, res) => {
    try {
        const { first_name, last_name, email, password, phone, countrycode } = req.body;

        // Basic validation
        if (!email || !password || !first_name || !last_name) {
            res.status(400).json({ message: 'Please fill all required fields' });
            return;
        }

        const userExists = await User.findOne({ email });

        if (userExists) {
            res.status(400).json({ message: 'User already exists' });
            return;
        }

        // Generate username if not provided
        const username = `${first_name} ${last_name}`;

        const user = await User.create({
            first_name,
            last_name,
            username,
            email,
            password,
            phone,
            countrycode,
            role: 'user'
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                username: user.username,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error("Registration Error:", error);
        res.status(500).json({ message: 'Server Error during registration', error: error.message });
    }
};

// Admin only: Create Customer Rep
const createRep = async (req, res) => {
    const { username, email, password } = req.body;

    // Check if requester is admin (Middleware should handle this, but double check)
    if (req.user.role !== 'admin') {
        res.status(401).json({ message: 'Not authorized as admin' });
        return;
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400).json({ message: 'User already exists' });
        return;
    }

    const user = await User.create({
        username,
        email,
        password,
        role: 'rep'
    });

    if (user) {
        res.status(201).json({
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
        });
    } else {
        res.status(400).json({ message: 'Invalid user data' });
    }
};

const deleteUser = async (req, res) => {
    // Rep or Admin can delete
    if (req.user.role !== 'admin' && req.user.role !== 'rep') {
        res.status(401).json({ message: 'Not authorized' });
        return;
    }

    const user = await User.findById(req.params.id);
    if (user) {
        await user.deleteOne();
        res.json({ message: 'User removed' });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

const logoutUser = (req, res) => {
    res.status(200).json({ message: 'Logged out successfully' });
};

const getUserProfile = async (req, res) => {
    const user = await User.findById(req.user._id);
    if (user) {
        res.json({
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

const updateUserProfile = async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        user.username = req.body.username || user.username;
        user.email = req.body.email || user.email;
        if (req.body.password) {
            user.password = req.body.password;
        }

        const updatedUser = await user.save();
        res.json({
            _id: updatedUser._id,
            username: updatedUser.username,
            email: updatedUser.email,
            role: updatedUser.role,
            token: generateToken(updatedUser._id),
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

const getUsers = async (req, res) => {
    // Admin/Rep only?
    if (req.user.role !== 'admin' && req.user.role !== 'rep') {
        res.status(401).json({ message: 'Not authorized' });
        return;
    }
    const users = await User.find({});
    res.json(users);
};

module.exports = { authUser, registerUser, logoutUser, getUserProfile, updateUserProfile, getUsers, createRep, deleteUser };
