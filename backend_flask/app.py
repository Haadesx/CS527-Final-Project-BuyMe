from flask import Flask, jsonify
from flask_cors import CORS
from config import Config
from models import db

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(app) # Enable CORS for all routes

    db.init_app(app)

    # Import and register blueprints
    from routes.auth import auth_bp
    from routes.items import items_bp
    from routes.auctions import auctions_bp
    from routes.bids import bids_bp
    from routes.admin import admin_bp
    from routes.questions import questions_bp
    from routes.alerts import alerts_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api')
    app.register_blueprint(items_bp, url_prefix='/api/item')
    app.register_blueprint(auctions_bp, url_prefix='/api/auction')
    app.register_blueprint(bids_bp, url_prefix='/api/bid')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(questions_bp, url_prefix='/api/question')
    app.register_blueprint(alerts_bp, url_prefix='/api/alert')
    
    from routes.notifications import notifications_bp
    app.register_blueprint(notifications_bp, url_prefix='/api/notification')

    @app.route('/')
    def index():
        return "API is running..."

    return app

if __name__ == '__main__':
    app = create_app()
    # Create DB tables if they don't exist
    with app.app_context():
        try:
            # Check for DB connection
             # logic to create db explicitly using pymysql if needed, or rely on sqlalchemy to create tables in existing db
            db.create_all()
            print("Database tables created.")
        except Exception as e:
            print(f"Error creating tables: {e}")
            
    app.run(port=3500, debug=True)
