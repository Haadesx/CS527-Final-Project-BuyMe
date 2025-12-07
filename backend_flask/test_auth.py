import requests
import json

BASE_URL = 'http://127.0.0.1:3500/api'

def test_register():
    url = f"{BASE_URL}/user"
    data = {
        "username": "testuser",
        "first_name": "Test",
        "last_name": "User",
        "email": "test@example.com",
        "password": "password123",
        "phone": "1234567890",
        "countrycode": "+1"
    }
    response = requests.post(url, json=data)
    print(f"Register Status: {response.status_code}")
    print(f"Register Response: {response.text}")
    return response.json() if response.status_code == 201 else None

def test_login():
    url = f"{BASE_URL}/auth/login"
    data = {
        "email": "test@example.com",
        "password": "password123"
    }
    response = requests.post(url, json=data)
    print(f"Login Status: {response.status_code}")
    print(f"Login Response: {response.text}")
    if response.status_code == 200:
        return response.json().get('data') # Token is in data
    return None

def test_profile(token):
    url = f"{BASE_URL}/profile"
    headers = {'Authorization': f'Bearer {token}'}
    response = requests.get(url, headers=headers)
    print(f"Profile Status: {response.status_code}")
    print(f"Profile Response: {response.text}")

if __name__ == "__main__":
    try:
        user_data = test_register()
        if user_data:
            print("Register Success")
        else:
            print("Register Failed or User already exists")
            
        token = test_login()
        if token:
            print("Login Success")
            test_profile(token)
        else:
            print("Login Failed")
    except Exception as e:
        print(f"Error: {e}")
