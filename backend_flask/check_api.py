import requests
import json

base_url = "http://127.0.0.1:3500/api"

try:
    # Check Auction
    print("--- Getting Auction 2 ---")
    r = requests.get(f"{base_url}/auction/2")
    if r.status_code == 200:
        print(json.dumps(r.json(), indent=2))
    else:
        print(f"Error {r.status_code}: {r.text}")

    # Check Items for Auction 2
    print("\n--- Getting Items for Auction 2 ---")
    r = requests.get(f"{base_url}/item/auction/2")
    if r.status_code == 200:
        print(json.dumps(r.json(), indent=2))
    else:
        print(f"Error {r.status_code}: {r.text}")

except Exception as e:
    print(f"Failed to connect: {e}")
