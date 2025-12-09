from flask import Blueprint, jsonify, request
from models import db, Notification
from routes.auth import protect

notifications_bp = Blueprint('notifications', __name__)

@notifications_bp.route('/', methods=['GET'])
@protect
def get_notifications():
    """Get all notifications for the logged-in user"""
    # Limit to last 50 to avoid overload
    notifications = Notification.query.filter_by(user_id=request.user.id)\
        .order_by(Notification.created_at.desc()).limit(50).all()
        
    return jsonify({'data': [n.to_dict() for n in notifications]})

@notifications_bp.route('/<int:notification_id>/read', methods=['PUT'])
@protect
def mark_read(notification_id):
    """Mark a notification as read"""
    notification = Notification.query.get_or_404(notification_id)
    
    if notification.user_id != request.user.id:
        return jsonify({'message': 'Not authorized'}), 401
        
    notification.is_read = True
    db.session.commit()
    
    return jsonify({'data': notification.to_dict()})

@notifications_bp.route('/unread-count', methods=['GET'])
@protect
def get_unread_count():
    count = Notification.query.filter_by(user_id=request.user.id, is_read=False).count()
    return jsonify({'data': {'count': count}})
