from flask import Blueprint, request, jsonify
from models import db, Hearing, Case
from datetime import date, timedelta

hearings_bp = Blueprint('hearings', __name__)

@hearings_bp.route('/<int:case_id>/hearings', methods=['GET'])
def get_hearings(case_id):
    Case.query.get_or_404(case_id)
    hearings = Hearing.query.filter_by(case_id=case_id).order_by(Hearing.hearing_date.desc()).all()
    return jsonify([h.to_dict() for h in hearings])


@hearings_bp.route('/<int:case_id>/hearings', methods=['POST'])
def add_hearing(case_id):
    Case.query.get_or_404(case_id)
    data = request.json
    hearing = Hearing(
        case_id      = case_id,
        hearing_date = date.fromisoformat(data['hearing_date']),
        hearing_time = data.get('hearing_time', '10:30 AM'),
        purpose      = data.get('purpose'),
        outcome      = data.get('outcome'),
        next_date    = date.fromisoformat(data['next_date']) if data.get('next_date') else None,
    )
    db.session.add(hearing)
    db.session.commit()
    return jsonify(hearing.to_dict()), 201


@hearings_bp.route('/hearings/<int:hearing_id>', methods=['PUT'])
def update_hearing(hearing_id):
    hearing = Hearing.query.get_or_404(hearing_id)
    data = request.json
    if 'outcome' in data:
        hearing.outcome = data['outcome']
    if 'next_date' in data and data['next_date']:
        hearing.next_date = date.fromisoformat(data['next_date'])
    if 'purpose' in data:
        hearing.purpose = data['purpose']
    db.session.commit()
    return jsonify(hearing.to_dict())


@hearings_bp.route('/cause-list', methods=['GET'])
def cause_list():
    target = request.args.get('date', date.today().isoformat())
    target_date = date.fromisoformat(target)
    hearings = (
        Hearing.query
        .filter_by(hearing_date=target_date)
        .join(Case)
        .order_by(Hearing.hearing_time)
        .all()
    )
    result = []
    for h in hearings:
        result.append({
            'hearing_id':   h.id,
            'case_number':  h.case.case_number,
            'title':        h.case.title,
            'client_name':  h.case.client_name,
            'court':        h.case.court,
            'hearing_time': h.hearing_time,
            'purpose':      h.purpose,
        })
    return jsonify(result)


@hearings_bp.route('/upcoming', methods=['GET'])
def upcoming_hearings():
    today = date.today()
    next_week = today + timedelta(days=7)
    hearings = (
        Hearing.query
        .filter(Hearing.hearing_date >= today, Hearing.hearing_date <= next_week)
        .join(Case)
        .order_by(Hearing.hearing_date)
        .all()
    )
    result = []
    for h in hearings:
        result.append({
            **h.to_dict(),
            'case_number': h.case.case_number,
            'title':       h.case.title,
            'client_name': h.case.client_name,
            'court':       h.case.court,
        })
    return jsonify(result)