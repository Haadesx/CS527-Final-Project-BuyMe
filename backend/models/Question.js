const mongoose = require('mongoose');

const questionSchema = mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    question: {
        type: String,
        required: true
    },
    answer: {
        type: String,
        default: ''
    },
    rep_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    is_answered: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

const Question = mongoose.model('Question', questionSchema);

module.exports = Question;
