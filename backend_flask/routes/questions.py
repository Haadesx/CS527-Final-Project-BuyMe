from flask import Blueprint, jsonify, request
from models import db, Question, User
from routes.auth import protect

questions_bp = Blueprint('questions', __name__)

@questions_bp.route('/', methods=['POST'])
@protect
def create_question():
    """Create a new question"""
    data = request.json
    
    if not data.get('question'):
        return jsonify({'message': 'Question text is required'}), 400
    
    question = Question(
        text=data['question'],
        asker_id=request.user.id
    )
    
    db.session.add(question)
    db.session.commit()
    
    return jsonify({'data': question.to_dict()}), 201

@questions_bp.route('/', methods=['GET'])
def get_all_questions():
    """Get all questions (for customer reps)"""
    questions = Question.query.order_by(Question.timestamp.desc()).all()
    return jsonify({'data': [q.to_dict() for q in questions]})

@questions_bp.route('/unanswered', methods=['GET'])
@protect
def get_unanswered_questions():
    """Get all unanswered questions (for customer reps)"""
    if not request.user.is_rep and not request.user.is_admin:
        return jsonify({'message': 'Not authorized'}), 401
    
    questions = Question.query.filter_by(answer=None).order_by(Question.timestamp.desc()).all()
    return jsonify({'data': [q.to_dict() for q in questions]})

@questions_bp.route('/my', methods=['GET'])
@protect
def get_my_questions():
    """Get questions asked by the logged-in user"""
    questions = Question.query.filter_by(asker_id=request.user.id).order_by(Question.timestamp.desc()).all()
    return jsonify({'data': [q.to_dict() for q in questions]})

@questions_bp.route('/<int:question_id>/answer', methods=['PUT'])
@protect
def answer_question(question_id):
    """Answer a question (customer rep only)"""
    if not request.user.is_rep and not request.user.is_admin:
        return jsonify({'message': 'Not authorized'}), 401
    
    question = Question.query.get_or_404(question_id)
    data = request.json
    
    if not data.get('answer'):
        return jsonify({'message': 'Answer text is required'}), 400
    
    question.answer = data['answer']
    question.responder_id = request.user.id
    
    db.session.commit()
    
    return jsonify({'data': question.to_dict()})

@questions_bp.route('/<int:question_id>', methods=['DELETE'])
@protect
def delete_question(question_id):
    """Delete a question (admin or asker only)"""
    question = Question.query.get_or_404(question_id)
    
    if question.asker_id != request.user.id and not request.user.is_admin:
        return jsonify({'message': 'Not authorized'}), 401
    
    db.session.delete(question)
    db.session.commit()
    
    return jsonify({'data': {'message': 'Question deleted'}})
