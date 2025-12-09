from app import create_app
from models import db, User, Auction, Item
from datetime import datetime, timedelta

app = create_app()

with app.app_context():
    # Find a seller
    seller = User.query.filter_by(email='seller@example.com').first()
    if not seller:
        seller = User.query.filter_by(is_admin=False).first()
        if not seller:
            print("No seller found. Please run seed_data.py first or create a user.")
            exit()

    print(f"Using seller: {seller.username}")

    featured_items = [
        {
            'name': '1967 Shelby GT500',
            'description': 'A classic American muscle car. 1967 Shelby GT500 in pristine condition. Carroll Shelby’s masterpiece.',
            'category': 'Luxury Vehicles',
            'image': 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=2670&auto=format&fit=crop',
            'price': 250000.0
        },
        {
            'name': 'Patek Philippe Nautilus',
            'description': 'Brand new Patek Philippe Nautilus using steel. One of the most desirable watches in the world.',
            'category': 'Jewelry & Watches',
            'image': 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=2680&auto=format&fit=crop',
            'price': 120000.0
        },
        {
            'name': 'Villa in Tuscany',
            'description': 'A stunning 5-bedroom villa located in the heart of Tuscany, Italy. Includes a vineyard and pool.',
            'category': 'Real Estate',
            'image': 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2670&auto=format&fit=crop',
            'price': 4500000.0
        }
    ]

    for data in featured_items:
        # Check if exists to avoid duplicates (by name)
        existing = Item.query.filter_by(name=data['name']).first()
        if existing:
            print(f"Item '{data['name']}' already exists. Skipping.")
            continue

        item = Item(
            name=data['name'],
            description=data['description'],
            category=data['category'],
            seller_id=seller.id,
            image_url=data['image']
        )
        db.session.add(item)
        db.session.flush() # get ID

        auction = Auction(
            item_id=item.id,
            start_time=datetime.utcnow(),
            end_time=datetime.utcnow() + timedelta(days=14), # 2 week auction
            initial_price=data['price'],
            current_price=data['price'],
            min_price=data['price'],
            increment=data['price'] * 0.05, # 5% increment
            is_active=True
        )
        db.session.add(auction)
        print(f"Added {data['name']}")

    db.session.commit()
    print("Featured items seeded successfully.")
