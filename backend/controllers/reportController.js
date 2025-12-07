const Auction = require('../models/Auction');
const Bid = require('../models/Bid');
const Item = require('../models/Item');
const User = require('../models/User');

const getEarningsReport = async (req, res) => {
    // Only Admin
    if (req.user.role !== 'admin') {
        res.status(401).json({ message: 'Not authorized' });
        return;
    }

    try {
        // 1. Total Earnings: Sum of current_price of all items in closed auctions (or just all items with bids?)
        // Let's assume earnings = sum of current_price of items where auction end_time < now
        // Or better, let's just sum up all current_prices of items that have bids.

        // Actually, "Earnings" usually means the platform's cut, but here it likely means "Total Sales Volume".
        // Let's calculate Total Sales Volume.

        const items = await Item.find({});
        let totalEarnings = 0;
        items.forEach(item => {
            if (item.current_price > item.start_price) { // Assuming if price moved, it's sold/active
                totalEarnings += item.current_price;
            }
        });

        // 2. Earnings per Item
        const earningsPerItem = await Item.aggregate([
            { $match: { current_price: { $gt: 0 } } }, // Filter items with price
            { $project: { item_id: "$_id", total: "$current_price" } }
        ]);

        // 3. Earnings per Item Type (Category)
        // We need to join Item with Auction to get Category? 
        // Wait, Category is on Auction level.
        // Item has auction_id.

        const earningsPerCategory = await Item.aggregate([
            {
                $lookup: {
                    from: "auctions",
                    localField: "auction_id",
                    foreignField: "_id",
                    as: "auction"
                }
            },
            { $unwind: "$auction" },
            {
                $group: {
                    _id: "$auction.category",
                    total: { $sum: "$current_price" }
                }
            },
            { $project: { category: "$_id", total: 1, _id: 0 } }
        ]);

        // 4. Earnings per Seller
        // Auction has seller_id.
        const earningsPerSeller = await Item.aggregate([
            {
                $lookup: {
                    from: "auctions",
                    localField: "auction_id",
                    foreignField: "_id",
                    as: "auction"
                }
            },
            { $unwind: "$auction" },
            {
                $group: {
                    _id: "$auction.seller_id",
                    total: { $sum: "$current_price" }
                }
            },
            { $project: { seller_id: "$_id", total: 1, _id: 0 } }
        ]);

        // 5. Best Selling Items (Top 5 by price)
        const bestSellingItems = await Item.find({}).sort({ current_price: -1 }).limit(5).select('_id current_price item_name');
        const formattedBestSelling = bestSellingItems.map(i => ({ item_id: i._id, total: i.current_price }));

        // 6. Best Buyers (Top 5 spenders)
        // We need to find the highest bid for each item, then group by user.
        // This is complex because we only store current_price on Item, but we need to know WHO holds that price.
        // We can look at the Bid collection, find the highest bid for each item, then sum by user.

        // Strategy: Get all items. For each item, find the winning bid (highest amount). 
        // Then sum these winning bid amounts by user_id.

        // Alternative: Just aggregate on Bids where is_winning is true? We don't have is_winning.
        // We can aggregate on Bids, group by item_id, pick max amount, then sum by user.

        const bestBuyers = await Bid.aggregate([
            { $sort: { amount: -1 } },
            {
                $group: {
                    _id: "$item_id",
                    winner_id: { $first: "$user_id" },
                    winning_amount: { $first: "$amount" }
                }
            },
            {
                $group: {
                    _id: "$winner_id",
                    total: { $sum: "$winning_amount" }
                }
            },
            { $sort: { total: -1 } },
            { $limit: 5 },
            { $project: { bidder_id: "$_id", total: 1, _id: 0 } }
        ]);

        res.json({
            data: {
                totalEarnings,
                earningsPerItem,
                earningsPerCategory, // This covers "Item Type" too
                earningsPerItemType: earningsPerCategory,
                earningsPerSeller,
                bestSellingItems: formattedBestSelling,
                bestBuyers
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { getEarningsReport };
