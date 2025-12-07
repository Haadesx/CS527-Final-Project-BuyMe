from flask import Blueprint, jsonify, request
from models import db, Alert, Auction, Item
from routes.auth import protect

alerts_bp = Blueprint('alerts', __name__)

@alerts_bp.route('/', methods=['POST'])
@protect
def create_alert():
    """Create a new alert for items matching criteria"""
    data = request.json
    
    keywords = data.get('keywords', [])
    if isinstance(keywords, list):
        keywords = ','.join(keywords)
    
    alert = Alert(
        user_id=request.user.id,
        keywords=keywords,
        category=data.get('category'),
        min_price=data.get('min_price'),
        max_price=data.get('max_price'),
        is_active=True
    )
    
    db.session.add(alert)
    db.session.commit()
    
    return jsonify({'data': alert.to_dict()}), 201

@alerts_bp.route('/', methods=['GET'])
@protect
def get_my_alerts():
    """Get all alerts for the logged-in user"""
    alerts = Alert.query.filter_by(user_id=request.user.id).order_by(Alert.created_at.desc()).all()
    return jsonify({'data': [alert.to_dict() for alert in alerts]})

@alerts_bp.route('/<int:alert_id>', methods=['PUT'])
@protect
def update_alert(alert_id):
    """Update an alert (toggle active status or modify criteria)"""
    alert = Alert.query.get_or_404(alert_id)
    
    if alert.user_id != request.user.id:
        return jsonify({'message': 'Not authorized'}), 401
    
    data = request.json
    
    if 'is_active' in data:
        alert.is_active = data['is_active']
    if 'keywords' in data:
        keywords = data['keywords']
        if isinstance(keywords, list):
            keywords = ','.join(keywords)
        alert.keywords = keywords
    if 'category' in data:
        alert.category = data['category']
    if 'min_price' in data:
        alert.min_price = data['min_price']
    if 'max_price' in data:
        alert.max_price = data['max_price']
    
    db.session.commit()
    
    return jsonify({'data': alert.to_dict()})

@alerts_bp.route('/<int:alert_id>', methods=['DELETE'])
@protect
def delete_alert(alert_id):
    """Delete an alert"""
    alert = Alert.query.get_or_404(alert_id)
    
    if alert.user_id != request.user.id:
        return jsonify({'message': 'Not authorized'}), 401
    
    db.session.delete(alert)
    db.session.commit()
    
    return jsonify({'data': {'message': 'Alert deleted'}})

@alerts_bp.route('/matches', methods=['GET'])
@protect
def get_matching_auctions():
    """Get active auctions matching user's alerts"""
    alerts = Alert.query.filter_by(user_id=request.user.id, is_active=True).all()
    
    if not alerts:
        return jsonify({'data': []})
    
    matching_auctions = set()
    
    for alert in alerts:
        # Build query based on alert criteria
        query = db.session.query(Auction, Item).join(Item, Auction.item_id == Item.id)
        query = query.filter(Auction.is_active == True)
        
        # Filter by category
        if alert.category:
            query = query.filter(Item.category == alert.category)
        
        # Filter by price range
        if alert.min_price:
            query = query.filter(Auction.current_price >= alert.min_price)
        if alert.max_price:
            query = query.filter(Auction.current_price <= alert.max_price)
        
        # Filter by keywords
        if alert.keywords:
            keywords = alert.keywords.split(',')
            for keyword in keywords:
                keyword = keyword.strip()
                if keyword:
                    query = query.filter(
                        db.or_(
                            Item.name.ilike(f'%{keyword}%'),
                            Item.description.ilike(f'%{keyword}%')
                        )
                    )
        
        results = query.all()
        for auction, item in results:
            matching_auctions.add((auction.id, item.id))
    
    # Format results
    formatted_results = []
    for auction_id, item_id in matching_auctions:
        auction = Auction.query.get(auction_id)
        item = Item.query.get(item_id)
        if auction and item:
            formatted_results.append({
                'auction_id': auction.id,
                'auction_title': item.name,
                'category': item.category,
                'current_price': auction.current_price,
                'start_date': auction.start_time.isoformat() + 'Z',
                'end_date': auction.end_time.isoformat() + 'Z',
                'image_url': item.image_url
            })
    
    return jsonify({'data': formatted_results})
