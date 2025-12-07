"""
Test script for Question & Answer API endpoints
"""
import requests
import json

BASE_URL = "http://127.0.0.1:3500/api"

def test_questions():
    print("=" * 60)
    print("Testing Question & Answer API Endpoints")
    print("=" * 60)
    
    # Login as a regular user
    print("\n1. Login as regular user...")
    login_data = {
        "email": "testuser@example.com",
        "password": "password"
    }
    response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        user_token = response.json().get('data')  # Token is in 'data' field
        print(f"✓ Logged in successfully")
    else:
        print(f"✗ Login failed: {response.text}")
        return
    
    # Create a question
    print("\n2. Creating a question...")
    headers = {"Authorization": f"Bearer {user_token}"}
    question_data = {
        "question": "What is the condition of this item?"
    }
    response = requests.post(f"{BASE_URL}/question/", json=question_data, headers=headers)
    print(f"Status: {response.status_code}")
    if response.status_code == 201:
        question = response.json().get('data')
        question_id = question.get('question_id')
        print(f"✓ Question created with ID: {question_id}")
        print(f"  Question: {question.get('question')}")
        print(f"  Is Answered: {question.get('is_answered')}")
    else:
        print(f"✗ Failed: {response.text}")
        return
    
    # Get my questions
    print("\n3. Getting my questions...")
    response = requests.get(f"{BASE_URL}/question/my", headers=headers)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        questions = response.json().get('data', [])
        print(f"✓ Found {len(questions)} question(s)")
        for q in questions:
            print(f"  - {q.get('question')} (Answered: {q.get('is_answered')})")
    else:
        print(f"✗ Failed: {response.text}")
    
    # Login as admin/rep to answer
    print("\n4. Login as admin to answer question...")
    admin_login = {
        "email": "admin@buyme.com",
        "password": "admin123"
    }
    response = requests.post(f"{BASE_URL}/auth/login", json=admin_login)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        admin_token = response.json().get('data')  # Token is in 'data' field
        print(f"✓ Admin logged in successfully")
    else:
        print(f"✗ Admin login failed: {response.text}")
        return
    
    # Get unanswered questions
    print("\n5. Getting unanswered questions (as admin)...")
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    response = requests.get(f"{BASE_URL}/question/unanswered", headers=admin_headers)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        unanswered = response.json().get('data', [])
        print(f"✓ Found {len(unanswered)} unanswered question(s)")
    else:
        print(f"✗ Failed: {response.text}")
    
    # Answer the question
    print(f"\n6. Answering question ID {question_id}...")
    answer_data = {
        "answer": "The item is in excellent condition, barely used!"
    }
    response = requests.put(f"{BASE_URL}/question/{question_id}/answer", json=answer_data, headers=admin_headers)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        answered_question = response.json().get('data')
        print(f"✓ Question answered successfully")
        print(f"  Answer: {answered_question.get('answer')}")
        print(f"  Responder: {answered_question.get('responder')}")
    else:
        print(f"✗ Failed: {response.text}")
    
    # Get all questions
    print("\n7. Getting all questions...")
    response = requests.get(f"{BASE_URL}/question/")
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        all_questions = response.json().get('data', [])
        print(f"✓ Found {len(all_questions)} total question(s)")
        for q in all_questions:
            status = "✓ Answered" if q.get('is_answered') else "⏳ Pending"
            print(f"  - {status}: {q.get('question')}")
    else:
        print(f"✗ Failed: {response.text}")
    
    print("\n" + "=" * 60)
    print("Question & Answer API Test Complete!")
    print("=" * 60)

if __name__ == "__main__":
    try:
        test_questions()
    except Exception as e:
        print(f"\n✗ Error: {e}")
