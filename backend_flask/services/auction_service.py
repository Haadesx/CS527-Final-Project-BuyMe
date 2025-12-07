from models import db, Auction, Bid, User
from datetime import datetime

def place_bid_logic(auction_id, bidder_id, amount, upper_limit=None):
    auction = Auction.query.get(auction_id)
    if not auction:
        return {'error': 'Auction not found'}, 404
    
    if not auction.is_active or auction.end_time < datetime.utcnow():
        return {'error': 'Auction is closed'}, 400

    if auction.seller_id == bidder_id:
        return {'error': 'Seller cannot bid on their own item'}, 400

    # Minimal increment check
    min_bid = auction.current_price + auction.increment
    if auction.current_price == 0:
        min_bid = auction.initial_price

    if amount < min_bid:
        return {'error': f'Bid must be at least {min_bid}'}, 400

    # Logic for handling previous auto-bids
    # This is a simplified version. A robust one handles "bid wars".
    
    # Check if there is a current winner with an auto-bid
    # For now, we just place the bid. 
    # TODO: Implement full auto-bid logic.
    
    new_bid = Bid(
        auction_id=auction_id,
        bidder_id=bidder_id,
        amount=amount,
        is_auto_bid=bool(upper_limit),
        upper_limit=upper_limit,
        time=datetime.utcnow()
    )
    
    auction.current_price = amount
    auction.winner_id = bidder_id
    
    # Add to participants if not already
    bidder = User.query.get(bidder_id)
    if bidder not in auction.participants:
        auction.participants.append(bidder)
        
    db.session.add(new_bid)
    db.session.commit()
    
    return {'message': 'Bid placed successfully', 'current_price': amount, 'winner': bidder.username}, 200
