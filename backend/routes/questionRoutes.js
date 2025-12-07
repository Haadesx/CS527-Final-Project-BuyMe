const express = require('express');
const router = express.Router();
const { getQuestions, postQuestion, answerQuestion } = require('../controllers/questionController');
const { protect } = require('../middleware/authMiddleware');

router.get('/all', protect, getQuestions);
router.post('/', protect, postQuestion);
router.post('/answer/:id', protect, answerQuestion);

module.exports = router;
