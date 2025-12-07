const express = require('express');
const router = express.Router();
const { authUser, registerUser, logoutUser, getUserProfile, updateUserProfile, getUsers, createRep, deleteUser } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.post('/auth/login', authUser);
router.post('/auth/logout', logoutUser);
router.post('/user', registerUser);
router.get('/user', protect, getUsers);
router.route('/profile').get(protect, getUserProfile).put(protect, updateUserProfile);
router.post('/create-rep', protect, createRep);
router.delete('/user/:id', protect, deleteUser);

module.exports = router;
