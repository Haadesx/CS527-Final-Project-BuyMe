from flask import Blueprint, request, jsonify
from models import db, Auction, Item, User, Bid
from routes.auth import protect
from datetime import datetime

auctions_bp = Blueprint('auctions', __name__)

@auctions_bp.route('/', methods=['GET'])
def get_auctions():
    # Filters
    keyword = request.args.get('keyword')
    min_price = request.args.get('min_price')
    max_price = request.args.get('max_price')
    category = request.args.get('category')
    sort = request.args.get('sort')
    
    query = Auction.query
    
    # Keyword search (Title or Description) via Item join
    if keyword:
        query = query.join(Item).filter(
            (Item.name.ilike(f'%{keyword}%')) | 
            (Item.description.ilike(f'%{keyword}%'))
        )
    
    # Category filter
    if category and category != 'All':
        if not keyword: # If not already joined
             query = query.join(Item)
        query = query.filter(Item.category == category)
        
    # Price filter
    if min_price:
        query = query.filter(Auction.current_price >= float(min_price))
    if max_price:
        query = query.filter(Auction.current_price <= float(max_price))

    # Sorting
    if sort:
        if sort == 'price_asc':
            query = query.order_by(Auction.current_price.asc())
        elif sort == 'price_desc':
             query = query.order_by(Auction.current_price.desc())
        elif sort == 'date_asc':
             query = query.order_by(Auction.end_time.asc())
        elif sort == 'date_desc':
             query = query.order_by(Auction.end_time.desc())
    else:
        query = query.order_by(Auction.start_time.desc()) # Default
        
    auctions = query.all()
    # Serialize. to_dict() handles relationship loading
    return jsonify({'data': [a.to_dict() for a in auctions]})

@auctions_bp.route('/<int:id>', methods=['GET'])
def get_auction_by_id(id):
    auction = Auction.query.get(id)
    if auction:
        return jsonify({'data': auction.to_dict()})
    return jsonify({'message': 'Auction not found'}), 404

@auctions_bp.route('/', methods=['POST'])
@protect
def create_auction():
    data = request.get_json()
    
    # Extract data
    auction_title = data.get('auction_title')
    description = data.get('description')
    category = data.get('category')
    start_time_str = data.get('start_time')
    end_time_str = data.get('end_time')
    starting_price = float(data.get('starting_price'))
    min_price = float(data.get('min_price', 0)) # Reserve
    increment = float(data.get('increment', 1))
    
    image_url = data.get('image_url')
    
    # Parse dates
    start_time = datetime.fromisoformat(start_time_str.replace('Z', '+00:00'))
    end_time = datetime.fromisoformat(end_time_str.replace('Z', '+00:00'))

    # Transaction: Create Auction, Create Item, Link them
    try:
        new_item = Item(
            name=auction_title, # Using title as name
            description=description,
            category=category,
            seller_id=request.user.id,
            image_url=image_url
            # subcategory?
        )
        db.session.add(new_item)
        db.session.flush() # Get ID
        
        new_auction = Auction(
            item_id=new_item.id,
            start_time=start_time,
            end_time=end_time,
            initial_price=starting_price,
            current_price=starting_price,
            min_price=min_price,
            increment=increment,
            is_active=True
            # winner_id is None
        )
        db.session.add(new_auction)
        db.session.commit()
        
        return jsonify({'data': new_auction.to_dict()}), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error creating auction: {str(e)}'}), 500

@auctions_bp.route('/<int:id>', methods=['PUT'])
@protect
def update_auction(id):
    auction = Auction.query.get(id)
    if not auction:
        return jsonify({'message': 'Auction not found'}), 404
        
    # Check ownership (via Item owner)
    if auction.item.seller_id != request.user.id:
        return jsonify({'message': 'Not authorized'}), 401
        
    data = request.get_json()
    # Update logic... simplified for brevity
    # TODO: Implement update fields
    
    db.session.commit()
    return jsonify({'data': auction.to_dict()})

@auctions_bp.route('/<int:id>', methods=['DELETE'])
@protect
def delete_auction(id):
    auction = Auction.query.get(id)
    if not auction:
        return jsonify({'message': 'Auction not found'}), 404
        
    if auction.item.seller_id != request.user.id and not request.user.is_admin:
         return jsonify({'message': 'Not authorized'}), 401
         
    db.session.delete(auction)
    # Also delete item? Usually yes.
    if auction.item:
        db.session.delete(auction.item)
        
    db.session.commit()
    return jsonify({'message': 'Auction removed'})

@auctions_bp.route('/participate/<int:id>', methods=['POST'])
@protect
def participate_auction(id):
    auction = Auction.query.get(id)
    if not auction:
        return jsonify({'message': 'Auction not found'}), 404
        
    # Check if already participating
    if request.user in auction.participants:
         return jsonify({'message': 'Already participating'}), 200
         
    auction.participants.append(request.user)
    db.session.commit()
    
    return jsonify({'message': 'Successfully registered for auction'})

# Get similar items (from preceding month)
@auctions_bp.route('/similar/<int:auction_id>', methods=['GET'])
def get_similar_items(auction_id):
    """
    Find similar items that were auctioned in the preceding month.
    Similarity based on: same category, similar price range
    """
    from datetime import datetime, timedelta
    
    auction = Auction.query.get_or_404(auction_id)
    item = Item.query.get(auction.item_id)
    
    if not item:
        return jsonify({'data': []}), 404
    
    # Define "preceding month" - last 30 days from auction end time
    one_month_ago = auction.end_time - timedelta(days=30)
    
    # Find similar auctions (same category, within 50% price range)
    price_lower = auction.current_price * 0.5
    price_upper = auction.current_price * 1.5
    
    similar_auctions = db.session.query(Auction, Item)\
        .join(Item, Auction.item_id == Item.id)\
        .filter(Auction.id != auction_id)\
        .filter(Item.category == item.category)\
        .filter(Auction.current_price >= price_lower)\
        .filter(Auction.current_price <= price_upper)\
        .filter(Auction.end_time >= one_month_ago)\
        .filter(Auction.end_time <= auction.end_time)\
        .order_by(Auction.end_time.desc())\
        .limit(10)\
        .all()
    
    results = []
    for sim_auction, sim_item in similar_auctions:
        # Calculate similarity score (0-1)
        # Based on: category match (0.5) + price similarity (0.5)
        category_score = 1.0 if sim_item.category == item.category else 0.0
        
        price_diff = abs(sim_auction.current_price - auction.current_price)
        max_price = max(sim_auction.current_price, auction.current_price)
        price_score = 1.0 - min(price_diff / max_price, 1.0) if max_price > 0 else 0.0
        
        similarity_score = (category_score * 0.5) + (price_score * 0.5)
        
        # Count bids
        bid_count = Bid.query.filter_by(auction_id=sim_auction.id).count()
        
        results.append({
            'auction_id': sim_auction.id,
            'auction_title': sim_item.name,
            'category': sim_item.category,
            'subcategory': sim_item.subcategory,
            'current_price': sim_auction.current_price,
            'final_price': sim_auction.current_price,
            'bid_count': bid_count,
            'start_date': sim_auction.start_time.isoformat() + 'Z',
            'end_date': sim_auction.end_time.isoformat() + 'Z',
            'status': 'active' if sim_auction.is_active else 'closed',
            'winner_id': sim_auction.winner_id,
            'similarity_score': round(similarity_score, 2),
            'image_url': sim_item.image_url
        })
    
    return jsonify({'data': results})

