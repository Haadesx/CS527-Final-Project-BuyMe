from app import create_app
from models import db, User, Auction, Item
from werkzeug.security import generate_password_hash
from datetime import datetime, timedelta

app = create_app()

with app.app_context():
    # Admin
    if not User.query.filter_by(email='admin@buyme.com').first():
        admin = User(
            username='admin',
            first_name='Super',
            last_name='Admin',
            email='admin@buyme.com',
            password=generate_password_hash('admin123'),
            is_admin=True,
            is_rep=False
        )
        db.session.add(admin)
        print("Admin created.")

    # Seller
    seller = User.query.filter_by(email='seller@example.com').first()
    if not seller:
        seller = User(
            username='seller',
            first_name='John',
            last_name='Doe',
            email='seller@example.com',
            password=generate_password_hash('password'),
            is_admin=False,
            is_rep=False
        )
        db.session.add(seller)
        print("Seller created.")
    
    db.session.commit() # Get IDs

    # Auction with Image
    if not Item.query.first():
        item = Item(
            name='Luxury Watch',
            description='A beautiful gold watch.',
            category='Jewelry & Watches',
            seller_id=seller.id,
            image_url='https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=600&q=80'
        )
        db.session.add(item)
        db.session.flush()
        
        auction = Auction(
            item_id=item.id,
            start_time=datetime.utcnow(),
            end_time=datetime.utcnow() + timedelta(days=7),
            initial_price=5000.0,
            current_price=5000.0,
            min_price=0.0,
            increment=100.0,
            is_active=True
        )
        db.session.add(auction)
        db.session.commit()
        print("Auction created with image.")
