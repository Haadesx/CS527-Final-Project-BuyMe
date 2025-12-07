const mongoose = require('mongoose');

const bidSchema = mongoose.Schema({
    item_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Item'
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    amount: {
        type: Number,
        required: true,
    },
    upper_limit: {
        type: Number, // For auto-bidding
        default: null
    },
    is_auto_bid: {
        type: Boolean,
        default: false
    },
    timestamp: {
        type: Date,
        default: Date.now,
    }
}, {
    timestamps: true,
});

const Bid = mongoose.model('Bid', bidSchema);

module.exports = Bid;
