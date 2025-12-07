from app import create_app
from models import Auction

app = create_app()

with app.app_context():
    auction = Auction.query.get(2)
    if auction:
        print(f"Start: {auction.start_time} (Type: {type(auction.start_time)})")
        print(f"End: {auction.end_time} (Type: {type(auction.end_time)})")
        print(f"Dict: {auction.to_dict()}")
    else:
        print("Auction 2 not found")
