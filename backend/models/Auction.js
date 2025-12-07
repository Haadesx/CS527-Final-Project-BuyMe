const mongoose = require('mongoose');

const auctionSchema = mongoose.Schema({
    auction_title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    seller_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    category: {
        type: String,
        required: true,
    },
    start_time: {
        type: Date,
        required: true,
    },
    end_time: {
        type: Date,
        required: true,
    },
    starting_price: {
        type: Number,
        required: true,
    },
    current_price: {
        type: Number,
        default: 0,
    },
    min_price: {
        type: Number, // Secret reserve price
        default: 0
    },
    increment: {
        type: Number, // Minimum bid increment
        default: 1
    },
    is_active: {
        type: Boolean,
        default: true
    },
    items: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item'
    }],
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
}, {
    timestamps: true,
});

const Auction = mongoose.model('Auction', auctionSchema);

module.exports = Auction;
