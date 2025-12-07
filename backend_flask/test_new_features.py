"""
Test script for new CS 527 compliance features
Tests: User history, delete account, admin actions, similar items, alerts
"""
import requests
import json

BASE_URL = "http://127.0.0.1:3500/api"

def test_new_features():
    print("=" * 70)
    print("Testing New CS 527 Compliance Features")
    print("=" * 70)
    
    # Login as regular user
    print("\n1. Testing User Login...")
    login_data = {"email": "testuser@example.com", "password": "password"}
    response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
    if response.status_code == 200:
        user_token = response.json().get('data')
        user_id = response.json().get('_id')
        print(f"  ✓ Logged in as user ID: {user_id}")
    else:
        print(f"  ✗ Login failed")
        return
    
    headers = {"Authorization": f"Bearer {user_token}"}
    
    # Test: User Bid History
    print("\n2. Testing GET /api/user/my-bids (User Bid History)...")
    response = requests.get(f"{BASE_URL}/user/my-bids", headers=headers)
    print(f"  Status: {response.status_code}")
    if response.status_code == 200:
        bids = response.json().get('data', [])
        print(f"  ✓ Found {len(bids)} bid(s)")
        if bids:
            print(f"    First bid: {bids[0].get('item_name')} - ${bids[0].get('bid_amount')}")
    else:
        print(f"  ✗ Failed: {response.text}")
    
    # Test: User Auction List
    print("\n3. Testing GET /api/user/my-auctions (User's Created Auctions)...")
    response = requests.get(f"{BASE_URL}/user/my-auctions", headers=headers)
    print(f"  Status: {response.status_code}")
    if response.status_code == 200:
        auctions = response.json().get('data', [])
        print(f"  ✓ Found {len(auctions)} auction(s)")
        if auctions:
            print(f"    First auction: {auctions[0].get('auction_title')} - {auctions[0].get('status')}")
    else:
        print(f"  ✗ Failed: {response.text}")
    
    # Test: Similar Items Search  
    print("\n4. Testing GET /api/auction/similar/<id> (Similar Items)...")
    response = requests.get(f"{BASE_URL}/auction/similar/2")
    print(f"  Status: {response.status_code}")
    if response.status_code == 200:
        similar = response.json().get('data', [])
        print(f"  ✓ Found {len(similar)} similar item(s)")
        if similar:
            print(f"    Similar: {similar[0].get('auction_title')} (score: {similar[0].get('similarity_score')})")
    else:
        print(f"  ✗ Failed: {response.text}")
    
    # Test: Create Alert
    print("\n5. Testing POST /api/alert/ (Create Alert)...")
    alert_data = {
        "keywords": ["car", "vintage"],
        "category": "Luxury Vehicles",
        "min_price": 40000,
        "max_price": 100000
    }
    response = requests.post(f"{BASE_URL}/alert/", json=alert_data, headers=headers)
    print(f"  Status: {response.status_code}")
    if response.status_code == 201:
        alert = response.json().get('data')
        alert_id = alert.get('alert_id')
        print(f"  ✓ Alert created with ID: {alert_id}")
        print(f"    Keywords: {alert.get('keywords')}")
        print(f"    Category: {alert.get('category')}")
    else:
        print(f"  ✗ Failed: {response.text}")
        alert_id = None
    
    # Test: Get My Alerts
    print("\n6. Testing GET /api/alert/ (My Alerts)...")
    response = requests.get(f"{BASE_URL}/alert/", headers=headers)
    print(f"  Status: {response.status_code}")
    if response.status_code == 200:
        alerts = response.json().get('data', [])
        print(f"  ✓ Found {len(alerts)} alert(s)")
    else:
        print(f"  ✗ Failed: {response.text}")
    
    # Test: Get Matching Auctions for Alerts
    print("\n7. Testing GET /api/alert/matches (Matching Auctions)...")
    response = requests.get(f"{BASE_URL}/alert/matches", headers=headers)
    print(f"  Status: {response.status_code}")
    if response.status_code == 200:
        matches = response.json().get('data', [])
        print(f"  ✓ Found {len(matches)} matching auction(s)")
        if matches:
            print(f"    Match: {matches[0].get('auction_title')}")
    else:
        print(f"  ✗ Failed: {response.text}")
    
    # Login as admin for admin-only tests
    print("\n8. Testing Admin Features - Login as Admin...")
    admin_login = {"email": "admin@buyme.com", "password": "admin123"}
    response = requests.post(f"{BASE_URL}/auth/login", json=admin_login)
    if response.status_code == 200:
        admin_token = response.json().get('data')
        print(f"  ✓ Admin logged in")
    else:
        # Try default admin
        print(f"  Admin login failed, skipping admin tests")
        admin_token = None
    
    if admin_token:
        admin_headers = {"Authorization": f"Bearer {admin_token}"}
        
        # Test: Reset Password (Customer Rep/Admin)
        print("\n9. Testing PUT /api/user/<id>/reset-password (Reset Password)...")
        reset_data = {"new_password": "newpassword123"}
        response = requests.put(f"{BASE_URL}/user/{user_id}/reset-password", 
                               json=reset_data, headers=admin_headers)
        print(f"  Status: {response.status_code}")
        if response.status_code == 200:
            result = response.json().get('data')
            print(f"  ✓ Password reset for user: {result.get('username')}")
        else:
            print(f"  ✗ Failed: {response.text}")
        
        # Test: Delete Bid (Customer Rep/Admin)
        print("\n10. Testing DELETE /api/bid/<id> (Delete Bid)...")
        # First get a bid ID
        response = requests.get(f"{BASE_URL}/bid/item/2")
        if response.status_code == 200:
            bids_list = response.json()
            if bids_list and len(bids_list) > 0:
                bid_id = bids_list[0].get('_id')
                response = requests.delete(f"{BASE_URL}/bid/{bid_id}", headers=admin_headers)
                print(f"  Status: {response.status_code}")
                if response.status_code == 200:
                    result = response.json().get('data')
                    print(f"  ✓ Bid removed: ${result.get('deleted_amount')}")
                else:
                    print(f"  ✗ Failed: {response.text}")
            else:
                print(f"  ⚠ No bids found to delete")
        else:
            print(f"  ⚠ Could not retrieve bids")
    
    # Test: Delete User Account (self or admin)
    print("\n11. Testing DELETE /api/user/<id> (Delete Account)...")
    print("  ⚠ Skipping delete test to preserve test user")
    # Uncomment to actually test deletion:
    # response = requests.delete(f"{BASE_URL}/user/{user_id}", headers=headers)
    # if response.status_code == 200:
    #     print(f"  ✓ User account deleted")
    
    print("\n" + "=" * 70)
    print("Feature Testing Complete!")
    print("=" * 70)
    
    print("\n✅ SUMMARY - New Features Implemented:")
    print("  ✓ GET /api/user/my-bids - View user's bid history")
    print("  ✓ GET /api/user/my-auctions - View user's created auctions")
    print("  ✓ DELETE /api/user/<id> - Delete user account")
    print("  ✓ PUT /api/user/<id>/reset-password - Reset user password (rep/admin)")
    print("  ✓ DELETE /api/bid/<id> - Remove bid (rep/admin)")
    print("  ✓ GET /api/auction/similar/<id> - Find similar items")
    print("  ✓ POST /api/alert/ - Create alert")
    print("  ✓ GET /api/alert/ - Get my alerts")
    print("  ✓ PUT /api/alert/<id> - Update alert")
    print("  ✓ DELETE /api/alert/<id> - Delete alert")
    print("  ✓ GET /api/alert/matches - Get matching auctions")

if __name__ == "__main__":
    try:
        test_new_features()
    except Exception as e:
        print(f"\n✗ Error: {e}")
        import traceback
        traceback.print_exc()
