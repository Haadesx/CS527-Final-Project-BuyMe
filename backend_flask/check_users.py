from app import create_app
from models import db, User
from werkzeug.security import check_password_hash

app = create_app()

with app.app_context():
    users = User.query.all()
    print("--- Users in DB ---")
    for u in users:
        print(f"User: {u.email}, Role: {u.role}")
        
    print("\n--- Testing Login ---")
    u1 = User.query.filter_by(email='user1@example.com').first()
    if u1:
        print(f"User1 (password1): {check_password_hash(u1.password, 'password1')}")
        print(f"User1 (newpassword123): {check_password_hash(u1.password, 'newpassword123')}")
        
    u2 = User.query.filter_by(email='user2@example.com').first()
    if u2:
        print(f"User2 (password2): {check_password_hash(u2.password, 'password2')}")
