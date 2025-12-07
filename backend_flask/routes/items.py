from flask import Blueprint, request, jsonify
from models import db, Item, Auction
from routes.auth import protect

items_bp = Blueprint('items', __name__)

@items_bp.route('/', methods=['GET'])
def get_all_items():
    items = Item.query.all()
    # Join with auction to get status?
    result = []
    for item in items:
        data = item.to_dict()
        # Optionally add auction status
        if item.auction:
            data['auction_status'] = 'active' if item.auction.is_active else 'closed'
            data['current_price'] = item.auction.current_price
        result.append(data)
    return jsonify({'data': result})

@items_bp.route('/<int:id>', methods=['GET'])
def get_item_by_id(id):
    item = Item.query.get(id)
    if item:
        return jsonify({'data': item.to_dict()})
    return jsonify({'message': 'Item not found'}), 404

# Note: Create Item is handled in createAuction usually, but if needed separately:
@items_bp.route('/', methods=['POST'])
@protect
def create_item():
    data = request.get_json()
    new_item = Item(
        name=data.get('item_name'), 
        description=data.get('description'),
        category=data.get('category'),
        subcategory=data.get('subcategory'), # Added field
        seller_id=request.user.id
    )
    db.session.add(new_item)
    db.session.commit()
    return jsonify({'data': new_item.to_dict()}), 201

@items_bp.route('/auction/<int:auction_id>', methods=['GET'])
def get_items_by_auction_id(auction_id):
    # Determine what this route should return.
    # Node controller returned items where auction_id matches.
    # In my model, one item per auction.
    auction = Auction.query.get(auction_id)
    if auction and auction.item:
        return jsonify({'data': [auction.item.to_dict()]}) # Return list for compatibility
    return jsonify({'data': []})
