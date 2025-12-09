from flask import Blueprint, request, jsonify, current_app
from models import db, User
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import datetime
from functools import wraps

auth_bp = Blueprint('auth', __name__)

def generate_token(user_id):
    payload = {
        'id': user_id,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=30)
    }
    return jwt.encode(payload, current_app.config['SECRET_KEY'], algorithm='HS256')

# Middleware to protect routes
def protect(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith('Bearer '):
                token = auth_header.split(" ")[1]
        
        if not token:
            return jsonify({'message': 'Not authorized, no token'}), 401
        
        try:
            decoded = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
            current_user = User.query.get(decoded['id'])
            if not current_user:
                return jsonify({'message': 'User not found'}), 401
            # Add user to request context (handled differently in Flask usually, but passing via args or g)
            # For simplicity, we can inspect g.user if we assigned it, but for now we trust the ID.
            # Using custom attribute on request
            request.user = current_user
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Invalid token'}), 401
            
        return f(*args, **kwargs)
    return decorated

@auth_bp.route('/user', methods=['POST'])
def register_user():
    data = request.get_json()
    
    first_name = data.get('first_name')
    last_name = data.get('last_name')
    email = data.get('email')
    password = data.get('password')
    username = data.get('username') or f"{first_name} {last_name}"
    phone = data.get('phone')
    countrycode = data.get('countrycode')

    if not email or not password or not first_name or not last_name:
         return jsonify({'message': 'Please fill all required fields'}), 400

    if len(password) < 6:
        return jsonify({'message': 'Password must be at least 6 characters'}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({'message': 'User already exists'}), 400

    hashed_password = generate_password_hash(password)
    
    new_user = User(
        first_name=first_name,
        last_name=last_name,
        email=email,
        password=hashed_password,
        username=username,
        phone=phone,
        countrycode=countrycode,
        is_admin=False, # Default
        is_rep=False
    )
    
    try:
        db.session.add(new_user)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error creating user: {str(e)}'}), 500

    return jsonify({
        '_id': new_user.id,
        'username': new_user.username,
        'first_name': new_user.first_name,
        'last_name': new_user.last_name,
        'email': new_user.email,
        'role': new_user.role,
        'token': generate_token(new_user.id)
    }), 201

@auth_bp.route('/auth/login', methods=['POST'])
def login_user():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    user = User.query.filter_by(email=email).first()

    if user and check_password_hash(user.password, password):
        return jsonify({
            'data': generate_token(user.id), # Frontend expects token in 'data' or just root? Controller said 'data'.
            # Wait, controller: res.json({ data: token, _id: ... })
            '_id': user.id,
            'username': user.username,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'email': user.email,
            'role': user.role
        })
    else:
        return jsonify({'message': 'Invalid email or password'}), 401

@auth_bp.route('/auth/logout', methods=['POST'])
def logout_user():
    # Stateless JWT, just client side clears it usually.
    return jsonify({'message': 'Logged out successfully'}), 200

@auth_bp.route('/user', methods=['GET'])
@protect
def get_users():
    # Only Admin/Rep
    if not request.user.is_admin and not request.user.is_rep:
        return jsonify({'message': 'Not authorized'}), 401
    
    users = User.query.all()
    return jsonify([u.to_dict() for u in users])

@auth_bp.route('/profile', methods=['GET', 'PUT'])
@protect
def user_profile():
    user = request.user
    
    if request.method == 'GET':
        return jsonify(user.to_dict())
    
    if request.method == 'PUT':
        data = request.get_json()
        user.username = data.get('username', user.username)
        user.email = data.get('email', user.email)
        if data.get('password'):
            user.password = generate_password_hash(data.get('password'))
            
        try:
            db.session.commit()
        except IntegrityError:
            db.session.rollback()
            return jsonify({'message': 'Username or Email already taken'}), 400
            
        return jsonify({
            '_id': user.id,
            'username': user.username,
            'email': user.email,
            'role': user.role,
            'token': generate_token(user.id)
        })

@auth_bp.route('/create-rep', methods=['POST'])
@protect
def create_rep():
    if not request.user.is_admin:
        return jsonify({'message': 'Not authorized as admin'}), 401
        
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    
    if User.query.filter_by(email=email).first():
        return jsonify({'message': 'User already exists'}), 400
        
    new_user = User(
        username=username,
        email=email,
        password=generate_password_hash(password),
        is_rep=True
    )
    
    db.session.add(new_user)
    db.session.commit()
    
    return jsonify(new_user.to_dict()), 201

# Get user's bid history
@auth_bp.route('/user/my-bids', methods=['GET'])
@protect
def get_my_bids():
    """Get all bids placed by the logged-in user"""
    from models import Bid, Auction, Item
    
    bids = db.session.query(Bid, Auction, Item)\
        .join(Auction, Bid.auction_id == Auction.id)\
        .join(Item, Auction.item_id == Item.id)\
        .filter(Bid.bidder_id == request.user.id)\
        .order_by(Bid.time.desc())\
        .all()
    
    bid_history = []
    for bid, auction, item in bids:
        # Check if this is the winning bid
        is_winning = auction.current_price == bid.amount and auction.winner_id == request.user.id
        
        bid_history.append({
            'bid_id': bid.id,
            'auction_id': auction.id,
            'item_name': item.name,
            'item_category': item.category,
            'bid_amount': bid.amount,
            'bid_time': bid.time.isoformat() + 'Z',
            'is_auto_bid': bid.is_auto_bid,
            'auction_status': 'active' if auction.is_active else 'closed',
            'is_winning': is_winning,
            'current_price': auction.current_price
        })
    
    return jsonify({'data': bid_history})

# Get user's created auctions
@auth_bp.route('/user/my-auctions', methods=['GET'])
@protect
def get_my_auctions():
    """Get all auctions created by the logged-in user"""
    from models import Auction, Item
    
    auctions = db.session.query(Auction, Item)\
        .join(Item, Auction.item_id == Item.id)\
        .filter(Item.seller_id == request.user.id)\
        .order_by(Auction.start_time.desc())\
        .all()
    
    auction_list = []
    for auction, item in auctions:
        # Count bids for this auction
        from models import Bid
        bid_count = Bid.query.filter_by(auction_id=auction.id).count()
        
        auction_list.append({
            'auction_id': auction.id,
            'auction_title': item.name,
            'category': item.category,
            'current_price': auction.current_price,
            'min_price': auction.min_price,
            'bid_count': bid_count,
            'start_date': auction.start_time.isoformat() + 'Z',
            'end_date': auction.end_time.isoformat() + 'Z',
            'status': 'active' if auction.is_active else 'closed',
            'winner_id': auction.winner_id,
            'image_url': item.image_url
        })
    
    return jsonify({'data': auction_list})

# Delete user account
@auth_bp.route('/user/<int:user_id>', methods=['DELETE'])
@protect
def delete_user(user_id):
    """Delete a user account (self or admin)"""
    # Users can delete their own account, or admin can delete any account
    if request.user.id != user_id and not request.user.is_admin:
        return jsonify({'message': 'Not authorized to delete this account'}), 401
    
    user = User.query.get_or_404(user_id)
    
    # Don't allow deleting the last admin
    if user.is_admin:
        admin_count = User.query.filter_by(is_admin=True).count()
        if admin_count <= 1:
            return jsonify({'message': 'Cannot delete the last admin account'}), 400
    
    db.session.delete(user)
    db.session.commit()
    
    return jsonify({'data': {'message': 'User account deleted successfully'}})

# Reset user password (Customer Rep / Admin only)
@auth_bp.route('/user/<int:user_id>/reset-password', methods=['PUT'])
@protect
def reset_user_password(user_id):
    """Reset a user's password (Customer Rep / Admin only)"""
    if not request.user.is_rep and not request.user.is_admin:
        return jsonify({'message': 'Not authorized. Customer rep or admin access required.'}), 401
    
    user = User.query.get_or_404(user_id)
    data = request.get_json()
    
    new_password = data.get('new_password')
    if not new_password or len(new_password) < 6:
        return jsonify({'message': 'New password must be at least 6 characters'}), 400
    
    user.password = generate_password_hash(new_password)
    db.session.commit()
    
    return jsonify({'data': {
        'message': 'Password reset successfully',
        'user_id': user_id,
        'username': user.username
    }})

