const Auction = require('../models/Auction');
const Item = require('../models/Item');

const getAuctions = async (req, res) => {
    const { seller_id, keyword, category, min_price, max_price, sort } = req.query;
    let query = {};

    if (seller_id && seller_id !== 'undefined') {
        query.seller_id = seller_id;
    }

    // Keyword Search (Title or Description)
    if (keyword) {
        query.$or = [
            { auction_title: { $regex: keyword, $options: 'i' } },
            { description: { $regex: keyword, $options: 'i' } }
        ];
    }

    // Category Filter
    if (category && category !== 'All') {
        query.category = category;
    }

    // Price Range Filter
    if (min_price || max_price) {
        query.current_price = {};
        if (min_price) query.current_price.$gte = Number(min_price);
        if (max_price) query.current_price.$lte = Number(max_price);
    }

    // Active Auctions Only (Optional, or default?)
    // query.is_active = true; // Let's show all for now, or filter by status if requested

    let sortOption = {};
    if (sort) {
        if (sort === 'price_asc') sortOption.current_price = 1;
        if (sort === 'price_desc') sortOption.current_price = -1;
        if (sort === 'date_asc') sortOption.end_time = 1;
        if (sort === 'date_desc') sortOption.end_time = -1;
    } else {
        sortOption.createdAt = -1; // Default new to old
    }

    try {
        const auctions = await Auction.find(query).populate('items').sort(sortOption);
        res.json({ data: auctions });
    } catch (error) {
        console.error("Get Auctions Error:", error);
        res.status(500).json({ message: 'Server Error fetching auctions' });
    }
};

const getAuctionById = async (req, res) => {
    const auction = await Auction.findById(req.params.id).populate('items').populate('seller_id', 'username email');
    if (auction) {
        res.json(auction);
    } else {
        res.status(404).json({ message: 'Auction not found' });
    }
};

const createAuction = async (req, res) => {
    try {
        const { auction_title, description, category, start_time, end_time, starting_price, min_price, increment } = req.body;

        // 1. Create the Auction first
        const auction = new Auction({
            auction_title,
            description,
            category,
            start_time,
            end_time,
            starting_price,
            current_price: starting_price,
            min_price: min_price || 0,
            increment: increment || 1,
            seller_id: req.user._id,
            is_active: true
        });

        const createdAuction = await auction.save();

        // 2. Create the Item and link to Auction
        const item = await Item.create({
            item_name: auction_title, // Using title as item name for now
            description,
            start_price: starting_price,
            current_price: starting_price,
            auction_id: createdAuction._id,
            seller_id: req.user._id
        });

        // 3. Update Auction with Item reference
        createdAuction.items.push(item._id);
        await createdAuction.save();

        res.status(201).json(createdAuction);
    } catch (error) {
        console.error("Create Auction Error:", error);
        res.status(500).json({ message: 'Server Error during auction creation', error: error.message });
    }
};

const updateAuction = async (req, res) => {
    const auction = await Auction.findById(req.params.id);
    if (auction) {
        if (auction.seller_id.toString() !== req.user._id.toString()) {
            res.status(401).json({ message: 'Not authorized' });
            return;
        }
        auction.auction_title = req.body.auction_title || auction.auction_title;
        auction.description = req.body.description || auction.description;
        auction.category = req.body.category || auction.category;
        auction.start_time = req.body.start_time || auction.start_time;
        auction.end_time = req.body.end_time || auction.end_time;
        auction.min_price = req.body.min_price !== undefined ? req.body.min_price : auction.min_price;
        auction.increment = req.body.increment !== undefined ? req.body.increment : auction.increment;

        const updatedAuction = await auction.save();
        res.json(updatedAuction);
    } else {
        res.status(404).json({ message: 'Auction not found' });
    }
};

const deleteAuction = async (req, res) => {
    const auction = await Auction.findById(req.params.id);
    if (auction) {
        if (auction.seller_id.toString() !== req.user._id.toString()) {
            res.status(401).json({ message: 'Not authorized' });
            return;
        }
        await auction.deleteOne();
        res.json({ message: 'Auction removed' });
    } else {
        res.status(404).json({ message: 'Auction not found' });
    }
};

const getAuctionParticipants = async (req, res) => {
    const auction = await Auction.findById(req.params.id).populate('participants', 'username email');
    if (auction) {
        res.json(auction.participants);
    } else {
        res.status(404).json({ message: 'Auction not found' });
    }
};

const participateInAuction = async (req, res) => {
    const auction = await Auction.findById(req.params.id);
    if (auction) {
        if (!auction.participants.includes(req.user._id)) {
            auction.participants.push(req.user._id);
            await auction.save();
        }
        res.json({ message: 'Participated successfully' });
    } else {
        res.status(404).json({ message: 'Auction not found' });
    }
};

module.exports = { getAuctions, getAuctionById, createAuction, updateAuction, deleteAuction, getAuctionParticipants, participateInAuction };
