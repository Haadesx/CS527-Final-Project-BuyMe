from flask import Blueprint, jsonify, request
from models import db, Auction, Item, User
from routes.auth import protect
from sqlalchemy import func

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/reports/total_earnings', methods=['GET'])
@protect
def total_earnings():
    if not request.user.is_admin:
        return jsonify({'message': 'Not authorized'}), 401
        
    # Earnings = Sum of winning bids on items where auction is finished/active?
    # Usually finalized auctions.
    # Assuming is_active=False implies sold or expired.
    # Or check end_time < now.
    
    total = db.session.query(func.sum(Auction.current_price))\
        .filter(Auction.winner_id.isnot(None))\
        .scalar() or 0
        
    return jsonify({'data': {'total_earnings': total}})

@admin_bp.route('/reports/earnings_by_category', methods=['GET'])
@protect
def earnings_by_category():
    if not request.user.is_admin:
        return jsonify({'message': 'Not authorized'}), 401

    results = db.session.query(Item.category, func.sum(Auction.current_price))\
        .join(Auction, Item.auction)\
        .filter(Auction.winner_id.isnot(None))\
        .group_by(Item.category)\
        .all()
        
    return jsonify({'data': [{'category': r[0], 'earnings': r[1]} for r in results]})

@admin_bp.route('/reports/top_selling_items', methods=['GET'])
@protect
def top_selling_items():
    if not request.user.is_admin:
        return jsonify({'message': 'Not authorized'}), 401
    
    # Best selling items (Highest Price)
    results = db.session.query(Item.name, Auction.current_price)\
        .join(Auction, Item.auction)\
        .filter(Auction.winner_id.isnot(None))\
        .order_by(Auction.current_price.desc())\
        .limit(10)\
        .all()
        
    return jsonify({'data': [{'item': r[0], 'price': r[1]} for r in results]})

# Best Buyers
@admin_bp.route('/reports/best_buyers', methods=['GET'])
@protect
def best_buyers():
    if not request.user.is_admin:
        return jsonify({'message': 'Not authorized'}), 401

    results = db.session.query(User.username, func.sum(Auction.current_price))\
        .join(Auction, Auction.winner_id == User.id)\
        .group_by(User.id)\
        .order_by(func.sum(Auction.current_price).desc())\
        .limit(10)\
        .all()
        
    return jsonify({'data': [{'user': r[0], 'spent': r[1]} for r in results]})
