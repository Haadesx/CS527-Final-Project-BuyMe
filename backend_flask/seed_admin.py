from app import create_app
from models import db, User
from werkzeug.security import generate_password_hash

app = create_app()

with app.app_context():
    if User.query.filter_by(email='admin@buyme.com').first():
        print("Admin already exists.")
    else:
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
        db.session.commit()
        print("Admin created. Email: admin@buyme.com, Password: admin123")
