from flask import Blueprint, request, jsonify
from models import db, Bid, Item, Auction, User
from routes.auth import protect
from datetime import datetime

bids_bp = Blueprint('bids', __name__)

@bids_bp.route('/<int:item_id>', methods=['POST'])
@protect
def place_bid(item_id):
    data = request.get_json()
    amount = float(data.get('amount'))
    upper_limit = data.get('upper_limit')
    if upper_limit:
        upper_limit = float(upper_limit)
        
    item = Item.query.get(item_id)
    if not item:
        return jsonify({'message': 'Item not found'}), 404
        
    auction = item.auction
    if not auction:
        return jsonify({'message': 'Auction not found for this item'}), 404
        
    if item.seller_id == request.user.id:
        return jsonify({'message': 'Seller cannot bid on their own item'}), 400
        
    if not auction.is_active or (auction.end_time < datetime.utcnow()):
        return jsonify({'message': 'Auction is closed'}), 400
        
    # Validate Amount
    # Using auction.current_price or auction.initial_price if 0
    min_bid = auction.current_price + (auction.increment or 1.0)
    if auction.current_price == 0:
        if amount < auction.initial_price:
             return jsonify({'message': f'Bid must be at least start price {auction.initial_price}'}), 400
    elif amount < min_bid:
        return jsonify({'message': f'Bid must be at least {min_bid} (Current: {auction.current_price} + Increment: {auction.increment})'}), 400
        
    # Check against current highest bid
    # (Already checked by current_price sort of, but let's be safe)
    
    # Identify previous winner to notify
    previous_winner_id = auction.winner_id
    previous_high_bid = auction.current_price

    # Place Bid
    new_bid = Bid(
        auction_id=auction.id,
        bidder_id=request.user.id,
        amount=amount,
        upper_limit=upper_limit,
        is_auto_bid=False, # Manual bid
        time=datetime.utcnow()
    )
    db.session.add(new_bid)
    
    # Update Auction/Item Price
    auction.current_price = amount
    auction.winner_id = request.user.id
    
    # Add to participants
    if request.user not in auction.participants:
        auction.participants.append(request.user)
        
    # Notify previous winner if they exist and are not the current bidder
    if previous_winner_id and previous_winner_id != request.user.id:
        from models import Notification
        notification = Notification(
            user_id=previous_winner_id,
            title='Outbid Alert',
            description=f'You have been outbid on "{item.name}". The new price is ${amount}.',
            type='warning'
        )
        db.session.add(notification)

    db.session.commit()
    
    # Resolve Auto-Bidding
    resolve_auto_bidding(auction.id, auction.increment or 1.0)
    
    return jsonify({
        'message': 'Bid placed',
        'current_price': auction.current_price
    }), 201

def resolve_auto_bidding(auction_id, increment):
    active = True
    while active:
        # Get top 2 bids for this auction
        bids = Bid.query.filter_by(auction_id=auction_id).order_by(Bid.amount.desc()).limit(2).all()
        if len(bids) < 2:
            break
            
        winner = bids[0]
        loser = bids[1]
        
        # If loser has upper limit > winner amount
        if loser.upper_limit and loser.upper_limit > winner.amount:
            next_bid_amount = winner.amount + increment
            
            # Cap at upper limit
            if next_bid_amount > loser.upper_limit:
                next_bid_amount = loser.upper_limit
            
            # Only bid if it beats the winner (it should, unless limit reached)
            if next_bid_amount > winner.amount:
                # Loser fights back
                new_auto_bid = Bid(
                    auction_id=auction_id,
                    bidder_id=loser.bidder_id,
                    amount=next_bid_amount,
                    upper_limit=loser.upper_limit,
                    is_auto_bid=True,
                    time=datetime.utcnow()
                )
                db.session.add(new_auto_bid)
                
                # Update Auction
                auction = Auction.query.get(auction_id)
                auction.current_price = next_bid_amount
                auction.winner_id = loser.bidder_id
                
                db.session.commit()
                continue # Loop
        
        active = False

@bids_bp.route('/<int:item_id>', methods=['GET'])
def get_bids_by_item(item_id):
    # Need to find auction first? 
    # Or just join.
    # Bid has auction_id. Item has auction.
    item = Item.query.get(item_id)
    if not item or not item.auction:
         return jsonify([])
         
    bids = Bid.query.filter_by(auction_id=item.auction.id).order_by(Bid.time.desc()).all()
    
    # Format
    result = []
    for bid in bids:
        result.append({
            '_id': bid.id,
            'amount': bid.amount,
            'time': bid.time.isoformat(),
            'bidder': bid.bidder.username if bid.bidder else 'Unknown',
            'is_auto_bid': bid.is_auto_bid
        })
    return jsonify(result)

# Remove/Delete a bid (Customer Rep / Admin only)
@bids_bp.route('/<int:bid_id>', methods=['DELETE'])
@protect
def delete_bid(bid_id):
    """Delete a bid (Customer Rep or Admin only)"""
    if not request.user.is_rep and not request.user.is_admin:
        return jsonify({'message': 'Not authorized. Customer rep or admin access required.'}), 401
    
    bid = Bid.query.get_or_404(bid_id)
    auction = Auction.query.get(bid.auction_id)
    
    if not auction:
        return jsonify({'message': 'Auction not found'}), 404
    
    # Store info before deleting
    deleted_bid_amount = bid.amount
    deleted_bidder = bid.bidder.username if bid.bidder else 'Unknown'
    
    # Delete the bid
    db.session.delete(bid)
    
    # Recalculate auction current price
    remaining_bids = Bid.query.filter_by(auction_id=auction.id)\
        .order_by(Bid.amount.desc()).all()
    
    if remaining_bids:
        # Set to highest remaining bid
        auction.current_price = remaining_bids[0].amount
        auction.winner_id = remaining_bids[0].bidder_id
    else:
        # No bids left, reset to start price
        item = Item.query.get(auction.item_id)
        auction.current_price = item.start_price if item else auction.current_price
        auction.winner_id = None
    
    db.session.commit()
    
    return jsonify({'data': {
        'message': 'Bid removed successfully',
        'deleted_bid_id': bid_id,
        'deleted_amount': deleted_bid_amount,
        'deleted_bidder': deleted_bidder,
        'new_current_price': auction.current_price
    }})

