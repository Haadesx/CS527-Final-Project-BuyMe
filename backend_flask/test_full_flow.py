import requests
import json
import time

BASE_URL = 'http://127.0.0.1:3500/api'

def register(username, email, password):
    url = f"{BASE_URL}/user"
    data = {
        "username": username,
        "email": email,
        "password": password,
        "first_name": username, 
        "last_name": "Test"
    }
    # Might fail if exists, try login then
    res = requests.post(url, json=data)
    if res.status_code == 201:
        return res.json()['token'], res.json()['_id']
    elif res.status_code == 400:
        # Login
        res = requests.post(f"{BASE_URL}/auth/login", json={"email": email, "password": password})
        if res.status_code == 200:
             return res.json()['data'], res.json()['_id']
    print(f"Auth Failed: {res.text}")
    return None, None

def create_auction(token, title, start_price):
    url = f"{BASE_URL}/auction/"
    headers = {'Authorization': f'Bearer {token}'}
    data = {
        "auction_title": title,
        "description": "A test auction",
        "category": "Electronics",
        "start_time": "2025-01-01T10:00:00Z",
        "end_time": "2025-12-31T10:00:00Z",
        "starting_price": start_price,
        "min_price": start_price + 100,
        "increment": 10
    }
    res = requests.post(url, json=data, headers=headers)
    print(f"Create Auction: {res.status_code}")
    if res.status_code == 201:
        return res.json()
    print(res.text)
    return None

def place_bid(token, item_id, amount):
    url = f"{BASE_URL}/bid/{item_id}"
    headers = {'Authorization': f'Bearer {token}'}
    data = {'amount': amount}
    res = requests.post(url, json=data, headers=headers)
    print(f"Place Bid of {amount}: {res.status_code}")
    if res.status_code == 201:
        print(f"Success. Current Price: {res.json().get('current_price')}")
        return True
    print(f"Response: {res.text}")
    return False

def run_test():
    # 1. Login User A (Seller)
    token_a, id_a = register("seller1", "seller1@example.com", "password")
    if not token_a: return

    # 2. Login User B (Bidder)
    token_b, id_b = register("bidder1", "bidder1@example.com", "password")
    if not token_b: return

    # 3. User A creates Auction
    auction = create_auction(token_a, "Vintage Laptop", 500)
    if not auction: return
    
    # Needs item_id. The create response returns auction dict.
    # My Auction dict has 'item' dict inside?
    # No, check models.py: 'item': self.item.to_dict()
    # And 'item' dict has '_id'.
    
    item_id = auction['item']['_id']
    auction_id = auction['_id']
    print(f"Created Auction {auction_id} with Item {item_id}")

    # 4. User B bids
    place_bid(token_b, item_id, 550)
    
    # 5. User A tries to bid (Should fail)
    print("Testing Seller Bid (Should Fail):")
    place_bid(token_a, item_id, 600)
    
    # 6. User B bids again (Should fail if not higher than self? or just up price)
    # Actually self-bidding usually updates max bid if auto, but manual?
    print("Testing Low Bid (Should Fail):")
    place_bid(token_b, item_id, 510) 

    # 7. Check final status
    res = requests.get(f"{BASE_URL}/auction/{auction_id}")
    final_auction = res.json()
    print(f"Final Price: {final_auction['currentPrice']} Winner: {final_auction['winner']}")

if __name__ == "__main__":
    run_test()
