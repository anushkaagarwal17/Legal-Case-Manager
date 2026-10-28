from flask import Blueprint, request, jsonify
from models import db, User

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.json or {}
    email = (data.get('email') or '').strip().lower()
    name = (data.get('name') or '').strip()
    password = data.get('password')
    role = data.get('role', 'client')

    if not email or not name or not password:
        return jsonify({'error': 'Name, email, and password are required'}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'An account with this email already exists'}), 409

    user = User(
        name=name,
        email=email,
        password=password, # In prod can be hashed with bcrypt/werkzeug
        role=role,
        phone=data.get('phone'),
        specialization=data.get('specialization')
    )
    db.session.add(user)
    db.session.commit()

    return jsonify({
        'message': 'Account created successfully',
        'user': user.to_dict()
    }), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json or {}
    email = (data.get('email') or '').strip().lower()
    password = data.get('password')

    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400

    user = User.query.filter_by(email=email).first()
    if not user or user.password != password:
        return jsonify({'error': 'Invalid email or password'}), 401

    return jsonify({
        'message': 'Login successful',
        'user': user.to_dict(),
        'token': f'token_{user.id}_{user.role}'
    }), 200


@auth_bp.route('/lawyers', methods=['GET'])
def get_lawyers():
    """List all available lawyers for client case assignment"""
    lawyers = User.query.filter_by(role='lawyer').all()
    return jsonify([l.to_dict() for l in lawyers]), 200


@auth_bp.route('/clients', methods=['GET'])
def get_clients():
    """List all registered clients"""
    clients = User.query.filter_by(role='client').all()
    return jsonify([c.to_dict() for c in clients]), 200


@auth_bp.route('/users', methods=['GET'])
def get_all_users():
    users = User.query.all()
    return jsonify([u.to_dict() for u in users]), 200
