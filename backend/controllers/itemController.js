const Item = require('../models/Item');
const Auction = require('../models/Auction');

const createItem = async (req, res) => {
    const { item_name, description, starting_price, images } = req.body;
    const item = new Item({
        item_name,
        description,
        starting_price,
        current_price: starting_price,
        images
    });
    const createdItem = await item.save();
    res.status(201).json(createdItem);
};

const addItemToAuction = async (req, res) => {
    const { auctionId, itemId } = req.params;
    const auction = await Auction.findById(auctionId);
    const item = await Item.findById(itemId);

    if (auction && item) {
        auction.items.push(item._id);
        item.auction_id = auction._id;
        await auction.save();
        await item.save();
        res.json({ message: 'Item added to auction' });
    } else {
        res.status(404).json({ message: 'Auction or Item not found' });
    }
};

const getItemById = async (req, res) => {
    const item = await Item.findById(req.params.id);
    if (item) {
        res.json(item);
    } else {
        res.status(404).json({ message: 'Item not found' });
    }
};

const getAllItems = async (req, res) => {
    const items = await Item.find({});
    res.json(items);
};

const deleteItem = async (req, res) => {
    const item = await Item.findById(req.params.id);
    if (item) {
        await item.deleteOne();
        res.json({ message: 'Item removed' });
    } else {
        res.status(404).json({ message: 'Item not found' });
    }
};

const getItemsByAuctionId = async (req, res) => {
    const items = await Item.find({ auction_id: req.params.id });
    res.json(items);
};


module.exports = { createItem, addItemToAuction, getItemById, getAllItems, deleteItem, getItemsByAuctionId };
