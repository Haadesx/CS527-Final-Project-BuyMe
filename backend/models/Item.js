const mongoose = require('mongoose');

const itemSchema = mongoose.Schema({
    item_name: { type: String, required: true },
    description: { type: String, required: true },
    auction_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Auction' },
    starting_price: { type: Number, required: true },
    current_price: { type: Number, required: true, default: 0 },
    images: [{ type: String }]
}, {
    timestamps: true
});

const Item = mongoose.model('Item', itemSchema);
module.exports = Item;
