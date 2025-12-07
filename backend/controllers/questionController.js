const Question = require('../models/Question');

const getQuestions = async (req, res) => {
    try {
        const questions = await Question.find({}).sort({ asked_at: -1 });
        res.json({ data: questions });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const postQuestion = async (req, res) => {
    const { question_text } = req.body;

    if (!question_text) {
        res.status(400).json({ message: 'Question text is required' });
        return;
    }

    try {
        const question = await Question.create({
            user_id: req.user._id,
            question_text,
            asked_at: Date.now()
        });
        res.status(201).json({ data: question });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const answerQuestion = async (req, res) => {
    const { id } = req.params;
    const { answer_text } = req.body;

    if (req.user.role !== 'rep' && req.user.role !== 'admin') {
        res.status(401).json({ message: 'Not authorized' });
        return;
    }

    try {
        const question = await Question.findById(id);

        if (question) {
            question.answer_text = answer_text;
            question.rep_id = req.user._id;
            question.answered_at = Date.now();
            question.is_answered = true;

            const updatedQuestion = await question.save();
            res.json({ data: updatedQuestion });
        } else {
            res.status(404).json({ message: 'Question not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { getQuestions, postQuestion, answerQuestion };
