from flask import Blueprint, request, jsonify
from models import db, Case

cases_bp = Blueprint('cases', __name__)

@cases_bp.route('/', methods=['GET'])
def get_cases():
    search = request.args.get('search', '')
    status = request.args.get('status', '')
    case_type = request.args.get('type', '')

    query = Case.query
    if search:
        query = query.filter(
            db.or_(
                Case.case_number.ilike(f'%{search}%'),
                Case.title.ilike(f'%{search}%'),
                Case.client_name.ilike(f'%{search}%'),
            )
        )
    if status:
        query = query.filter(Case.status == status)
    if case_type:
        query = query.filter(Case.case_type == case_type)

    cases = query.order_by(Case.updated_at.desc()).all()
    return jsonify([c.to_dict() for c in cases])


@cases_bp.route('/<int:case_id>', methods=['GET'])
def get_case(case_id):
    case = Case.query.get_or_404(case_id)
    return jsonify(case.to_dict())


@cases_bp.route('/', methods=['POST'])
def add_case():
    data = request.json
    case = Case(
        case_number  = data['case_number'],
        title        = data['title'],
        client_name  = data['client_name'],
        client_phone = data.get('client_phone'),
        client_email = data.get('client_email'),
        case_type    = data['case_type'],
        court        = data['court'],
        status       = data.get('status', 'Active'),
        description  = data.get('description'),
    )
    db.session.add(case)
    db.session.commit()
    return jsonify(case.to_dict()), 201


@cases_bp.route('/<int:case_id>', methods=['PUT'])
def update_case(case_id):
    case = Case.query.get_or_404(case_id)
    data = request.json
    for field in ['title', 'client_name', 'client_phone', 'client_email',
                  'case_type', 'court', 'status', 'description']:
        if field in data:
            setattr(case, field, data[field])
    db.session.commit()
    return jsonify(case.to_dict())


@cases_bp.route('/<int:case_id>', methods=['DELETE'])
def delete_case(case_id):
    case = Case.query.get_or_404(case_id)
    db.session.delete(case)
    db.session.commit()
    return jsonify({'message': 'Case deleted'})


@cases_bp.route('/stats', methods=['GET'])
def get_stats():
    total    = Case.query.count()
    active   = Case.query.filter_by(status='Active').count()
    disposed = Case.query.filter_by(status='Disposed').count()
    civil    = Case.query.filter_by(case_type='Civil').count()
    criminal = Case.query.filter_by(case_type='Criminal').count()
    revenue  = Case.query.filter_by(case_type='Revenue').count()
    return jsonify({
        'total': total, 'active': active, 'disposed': disposed,
        'civil': civil, 'criminal': criminal, 'revenue': revenue,
    })