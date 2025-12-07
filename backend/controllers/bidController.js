const Bid = require('../models/Bid');
const Item = require('../models/Item');
const Auction = require('../models/Auction');

const placeBid = async (req, res) => {
    const { itemId } = req.params;
    const { amount, upper_limit } = req.body; // upper_limit is optional
    const item = await Item.findById(itemId);

    if (!item) {
        res.status(404).json({ message: 'Item not found' });
        return;
    }

    const auction = await Auction.findById(item.auction_id);
    if (!auction) {
        res.status(404).json({ message: 'Auction not found' });
        return;
    }

    if (!auction.is_active) {
        res.status(400).json({ message: 'Auction is closed' });
        return;
    }

    // 1. Validate Bid Increment
    const minBid = item.current_price + (auction.increment || 1);
    if (amount < minBid && item.current_price > 0) { // If first bid, amount can be starting price
        // Special case: if current_price is starting price and no bids yet? 
        // Let's assume current_price is always the highest bid or starting price.
        // If no bids, current_price is starting_price.
        // We should check if there are any bids.
    }

    // Check if amount is valid
    if (amount < item.current_price && amount < auction.starting_price) {
        res.status(400).json({ message: 'Bid must be higher than current price' });
        return;
    }

    // 2. Check for existing auto-bidder (The current winner)
    // Find the user with the highest bid on this item
    const highestBid = await Bid.findOne({ item_id: itemId }).sort({ amount: -1 });

    let currentWinner = null;
    let currentWinnerLimit = 0;

    if (highestBid) {
        currentWinner = highestBid.user_id;
        currentWinnerLimit = highestBid.upper_limit || 0;

        if (amount <= highestBid.amount) {
            res.status(400).json({ message: 'Bid must be higher than current highest bid' });
            return;
        }
    }

    // 3. Place the new bid (Manual Bid)
    const newBid = new Bid({
        item_id: itemId,
        user_id: req.user._id,
        amount: amount,
        upper_limit: upper_limit || null,
        is_auto_bid: false
    });
    await newBid.save();

    // Update item price
    item.current_price = amount;
    await item.save();

    // 4. Auto-Bidding Logic (Proxy Bidding)
    // If the previous winner had an upper limit, and it's higher than the new bid...
    if (highestBid && currentWinnerLimit > amount) {
        // The previous winner automatically bids again
        // New auto-bid amount = New Bid + Increment
        let autoBidAmount = amount + (auction.increment || 1);

        // If autoBidAmount exceeds their limit, they bid their limit (or we can say they lose if we strictly follow increment rules, but usually they bid their max)
        // Let's say they bid their max if increment pushes over? Or they bid exactly enough to beat?
        // eBay style: bid one increment over the challenger.

        if (autoBidAmount > currentWinnerLimit) {
            autoBidAmount = currentWinnerLimit; // Bid their max
        }

        // Only place auto-bid if it's actually higher than the new bid (it should be)
        if (autoBidAmount > amount) {
            const autoBid = new Bid({
                item_id: itemId,
                user_id: currentWinner, // The previous winner fights back
                amount: autoBidAmount,
                upper_limit: currentWinnerLimit, // Keep their limit
                is_auto_bid: true
            });
            await autoBid.save();

            item.current_price = autoBidAmount;
            await item.save();

            // Notify the manual bidder they were immediately outbid? (Handled by notification service usually)
        }
    }
    // 5. Reverse Auto-Bidding: If the NEW bidder has a limit, and the OLD winner also has a limit...
    // They might fight instantly until one limit is reached.
    // For simplicity, let's handle just one step of reaction or a loop. 
    // A loop is better.

    // Let's Refactor for a Loop Battle
    // We need to re-evaluate who is winning and if the loser has a limit to bid back.

    // ... (This complex logic is better handled by a dedicated function, but let's stick to the basic "One-Step" or "Immediate Resolution" for now to avoid infinite loops in this turn)
    // Actually, if New Bidder has a high limit, and Old Bidder has a high limit, the system should calculate the winner instantly.
    // Winner = Person with higher limit.
    // Winning Price = Loser's Limit + Increment.

    // Let's implement the "Instant Resolution" logic if both have limits.

    // ... (Re-thinking implementation for simplicity and robustness)

    // Let's stick to the code I wrote above for now: 
    // 1. New manual bid is placed.
    // 2. If old winner has limit > new bid, old winner auto-bids back.
    // 3. What if New Bidder ALSO had a limit? 
    //    If Old Winner auto-bids, we need to check if New Bidder auto-bids back.
    //    This requires a loop.

    // I will implement a recursive/loop check here.

    await resolveAutoBidding(itemId, auction.increment || 1);

    // Update Auction Price (Max of items)
    if (item.auction_id) {
        const auctionToUpdate = await Auction.findById(item.auction_id);
        if (auctionToUpdate && item.current_price > auctionToUpdate.current_price) {
            auctionToUpdate.current_price = item.current_price;
            await auctionToUpdate.save();
        }
    }

    res.status(201).json({ message: 'Bid placed', current_price: item.current_price });
};

// Helper to resolve auto-bidding wars
const resolveAutoBidding = async (itemId, increment) => {
    let active = true;
    while (active) {
        // Get top 2 bids
        const bids = await Bid.find({ item_id: itemId }).sort({ amount: -1 }).limit(2);
        if (bids.length < 2) break;

        const winner = bids[0];
        const loser = bids[1];

        // If loser has an upper limit higher than winner's amount...
        if (loser.upper_limit && loser.upper_limit > winner.amount) {
            // Loser bids again
            let nextBidAmount = winner.amount + increment;
            if (nextBidAmount > loser.upper_limit) {
                nextBidAmount = loser.upper_limit;
            }

            // If next bid is valid (higher than current winner), place it
            if (nextBidAmount > winner.amount) {
                const autoBid = new Bid({
                    item_id: itemId,
                    user_id: loser.user_id,
                    amount: nextBidAmount,
                    upper_limit: loser.upper_limit,
                    is_auto_bid: true
                });
                await autoBid.save();

                // Update item price
                await Item.findByIdAndUpdate(itemId, { current_price: nextBidAmount });
                continue; // Loop again to see if the other person fights back
            }
        }
        active = false; // No more moves
    }
};

const getBidsByItem = async (req, res) => {
    const bids = await Bid.find({ item_id: req.params.itemId }).populate('user_id', 'username');
    res.json(bids);
};

module.exports = { placeBid, getBidsByItem };
