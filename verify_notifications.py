import requests
import json
import time
from datetime import datetime, timedelta

BASE_URL = "http://localhost:3500/api"

def login(email, password):
    res = requests.post(f"{BASE_URL}/auth/login", json={"email": email, "password": password})
    if res.status_code == 200:
        return res.json()['data']
    return None

def login_or_register(email, password, username):
    token = login(email, password)
    if token:
        return token
    
    res = requests.post(f"{BASE_URL}/user", json={
        "email": email, 
        "password": password, 
        "username": username,
        "first_name": username,
        "last_name": "User"
    })
    if res.status_code == 201:
        return login(email, password)
    print(f"Register failed for {email}: {res.text}")
    return None

def create_auction(token, title):
    start = datetime.utcnow()
    end = start + timedelta(minutes=10)
    data = {
        "auction_title": title,
        "description": "Test Item for Notifications",
        "category": "Collectibles",
        "starting_price": 100,
        "increment": 10,
        "start_time": start.strftime("%Y-%m-%dT%H:%M"),
        "end_time": end.strftime("%Y-%m-%dT%H:%M"),
        "image_url": "http://example.com/image.jpg"
    }
    headers = {"Authorization": f"Bearer {token}"}
    res = requests.post(f"{BASE_URL}/auction/", json=data, headers=headers)
    if res.status_code != 201:
        print(f"Create Auction failed: {res.text}")
        return None
    return res.json()['data']['item_id']

def place_bid(token, item_id, amount):
    headers = {"Authorization": f"Bearer {token}"}
    res = requests.post(f"{BASE_URL}/bid/{item_id}", json={"amount": amount}, headers=headers)
    return res

def get_notifications(token):
    headers = {"Authorization": f"Bearer {token}"}
    res = requests.get(f"{BASE_URL}/notification/", headers=headers)
    return res

def main():
    print("1. Login User1, User2, User3")
    token1 = login_or_register("user1@example.com", "password1", "user1")
    token2 = login_or_register("user2@example.com", "password2", "user2")
    token3 = login_or_register("user3@example.com", "password3", "user3")
    
    if not token1 or not token2 or not token3:
        print("Failed to login/register users")
        return

    print("2. User1 creates auction 'NotifyTest'")
    item_id = create_auction(token1, "NotifyTest")
    if not item_id:
        return
    print(f"   Auction Item ID: {item_id}")

    print("3. User2 bids 110 (Valid)")
    res = place_bid(token2, item_id, 110)
    print(f"   Bid 110 Status: {res.status_code} (Expected 201)")
    if res.status_code != 201:
        print(f"   Error: {res.text}")
    
    print("4. User3 bids 150 (Valid, Outbids User2)")
    res = place_bid(token3, item_id, 150)
    print(f"   Bid 150 Status: {res.status_code} (Expected 201)")
    if res.status_code != 201:
        print(f"   Error: {res.text}")

    print("5. User2 checks notifications for Outbid Alert")
    res = get_notifications(token2)
    if res.status_code == 200:
        notifs = res.json()['data']
        found = False
        for n in notifs:
            if "You have been outbid" in n['description'] and "NotifyTest" in n['description']:
                print(f"   SUCCESS: Found notification: {n['title']} - {n['description']}")
                found = True
                break
        if not found:
            print("   FAILURE: Outbid notification not found!")
            print(f"   All Notifications: {json.dumps(notifs, indent=2)}")
    else:
        print(f"   FAILURE: Notification API error: {res.status_code} {res.text}")

    print("6. User2 tries invalid bid 155 (Increment is 10, current 150 -> Needs 160)")
    res = place_bid(token2, item_id, 155)
    print(f"   Bid 155 Status: {res.status_code} (Expected 400)")
    
    try:
        msg = res.json().get('message', '')
        print(f"   Error Message: {msg}")
        if "Bid must be at least" in msg:
            print("   SUCCESS: Error message contains valid validation text.")
        else:
            print("   FAILURE: Error message does not match expected pattern.")
    except:
        print(f"   FAILURE: Could not parse error response: {res.text}")

if __name__ == "__main__":
    main()
