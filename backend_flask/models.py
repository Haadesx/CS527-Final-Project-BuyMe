from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    first_name = db.Column(db.String(50))
    last_name = db.Column(db.String(50))
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False) # Hashed
    phone = db.Column(db.String(20))
    countrycode = db.Column(db.String(5))
    is_admin = db.Column(db.Boolean, default=False)
    is_rep = db.Column(db.Boolean, default=False)
    
    # Relationships
    items = db.relationship('Item', backref='seller', lazy=True)
    bids = db.relationship('Bid', backref='bidder', lazy=True)
    questions_asked = db.relationship('Question', foreign_keys='Question.asker_id', backref='asker', lazy=True)
    questions_answered = db.relationship('Question', foreign_keys='Question.responder_id', backref='responder', lazy=True)

    @property
    def role(self):
        if self.is_admin: return 'admin'
        if self.is_rep: return 'rep'
        return 'user'

    def to_dict(self):
        return {
            '_id': self.id, # Mapping id to _id for frontend compatibility
            'username': self.username,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'email': self.email,
            'phone': self.phone,
            'role': self.role
            # Token will be added separately in auth response
        }

auction_participants = db.Table('auction_participants',
    db.Column('user_id', db.Integer, db.ForeignKey('users.id'), primary_key=True),
    db.Column('auction_id', db.Integer, db.ForeignKey('auctions.id'), primary_key=True)
)


class Item(db.Model):
    __tablename__ = 'items'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    category = db.Column(db.String(100), nullable=False)
    subcategory = db.Column(db.String(100))
    seller_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Relationship with Auction (One-to-One usually, but keeping it simple)
    # Relationship with Auction (One-to-One usually, but keeping it simple)
    auction = db.relationship('Auction', backref='item', uselist=False, lazy=True)
    image_url = db.Column(db.String(500))

    def to_dict(self):
        return {
            'item_id': self.id,
            'item_name': self.name,
            'item_desc': self.description,
            'category': self.category,
            'subcategory': self.subcategory,
            'seller_id': self.seller_id,
            'image_url': self.image_url,
            'current_price': self.auction.current_price if self.auction else 0
        }

class Auction(db.Model):
    __tablename__ = 'auctions'
    id = db.Column(db.Integer, primary_key=True)
    item_id = db.Column(db.Integer, db.ForeignKey('items.id'), nullable=False)
    start_time = db.Column(db.DateTime, default=datetime.utcnow)
    end_time = db.Column(db.DateTime, nullable=False)
    initial_price = db.Column(db.Float, nullable=False)
    increment = db.Column(db.Float, default=1.0)
    min_price = db.Column(db.Float) # Reserve price (secret)
    current_price = db.Column(db.Float, default=0.0)
    is_active = db.Column(db.Boolean, default=True)
    winner_id = db.Column(db.Integer, db.ForeignKey('users.id')) # Nullable until won

    bids = db.relationship('Bid', backref='auction', lazy=True, order_by="desc(Bid.amount)")
    participants = db.relationship('User', secondary='auction_participants', backref=db.backref('participated_auctions', lazy=True))

    def to_dict(self):
        return {
            'auction_id': self.id,
            'auction_title': self.item.name if self.item else "Unknown",
            'auction_desc': self.item.description if self.item else "",
            'image_url': self.item.image_url if self.item else None,
            'category': self.item.category if self.item else "",
            'item_id': self.item_id,
            'current_price': self.current_price,
            'start_date': self.start_time.isoformat() + 'Z',
            'end_date': self.end_time.isoformat() + 'Z',
            'is_active': self.is_active,
            'winner_id': self.winner_id,
            'participants': [u.username for u in self.participants]
        }

class Bid(db.Model):
    __tablename__ = 'bids'
    id = db.Column(db.Integer, primary_key=True)
    auction_id = db.Column(db.Integer, db.ForeignKey('auctions.id'), nullable=False)
    bidder_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    time = db.Column(db.DateTime, default=datetime.utcnow)
    is_auto_bid = db.Column(db.Boolean, default=False)
    upper_limit = db.Column(db.Float) # For auto-bidding

    def to_dict(self):
        return {
            '_id': self.id,
            'auctionId': self.auction_id,
            'bidder': self.bidder.username if self.bidder else None,
            'amount': self.amount,
            'time': self.time.isoformat()
        }

class Question(db.Model):
    __tablename__ = 'questions'
    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.Text, nullable=False)
    answer = db.Column(db.Text)
    asker_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    responder_id = db.Column(db.Integer, db.ForeignKey('users.id')) # Customer Rep
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'question_id': self.id,
            'question': self.text,
            'answer': self.answer,
            'is_answered': self.answer is not None,
            'asker': self.asker.username if self.asker else None,
            'asker_id': self.asker_id,
            'responder': self.responder.username if self.responder else None,
            'responder_id': self.responder_id,
            'timestamp': self.timestamp.isoformat() + 'Z' if self.timestamp else None
        }

class Alert(db.Model):
    __tablename__ = 'alerts'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    keywords = db.Column(db.Text)  # Comma-separated keywords
    category = db.Column(db.String(100))
    min_price = db.Column(db.Float)
    max_price = db.Column(db.Float)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    user = db.relationship('User', backref=db.backref('alerts', lazy=True))
    
    def to_dict(self):
        return {
            'alert_id': self.id,
            'user_id': self.user_id,
            'keywords': self.keywords.split(',') if self.keywords else [],
            'category': self.category,
            'min_price': self.min_price,
            'max_price': self.max_price,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() + 'Z' if self.created_at else None
        }


class Notification(db.Model):
    __tablename__ = 'notifications'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    type = db.Column(db.String(50), default='info') # info, success, warning, error
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationship handled by backref on User if we wanted, or here
    user_rel = db.relationship('User', backref=db.backref('notifications', lazy=True))

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'title': self.title,
            'description': self.description,
            'type': self.type,
            'is_read': self.is_read,
            'time': self.created_at.isoformat() + 'Z' if self.created_at else None
        }
