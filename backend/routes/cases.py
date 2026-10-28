from flask import Blueprint, request, jsonify
from datetime import datetime
from models import db, Case, Payment, User

cases_bp = Blueprint('cases', __name__)

@cases_bp.route('/', methods=['GET'])
def get_cases():
    search = request.args.get('search', '')
    status = request.args.get('status', '')
    case_type = request.args.get('type', '')
    role = request.args.get('role', '')
    user_id = request.args.get('user_id', type=int)

    query = Case.query

    # Role-based filtering for Lawyer vs. Client portals
    if role == 'client' and user_id:
        query = query.filter(Case.client_id == user_id)
    elif role == 'lawyer' and user_id:
        query = query.filter(Case.lawyer_id == user_id)

    # Search filter
    if search:
        query = query.filter(
            db.or_(
                Case.case_number.ilike(f'%{search}%'),
                Case.title.ilike(f'%{search}%'),
                Case.client_name.ilike(f'%{search}%'),
            )
        )
    if status and status != 'All':
        query = query.filter(Case.status == status)
    if case_type and case_type != 'All':
        query = query.filter(Case.case_type == case_type)

    cases = query.order_by(Case.updated_at.desc()).all()
    return jsonify([c.to_dict() for c in cases]), 200


@cases_bp.route('/<int:case_id>', methods=['GET'])
def get_case(case_id):
    case = Case.query.get_or_404(case_id)
    return jsonify(case.to_dict()), 200


@cases_bp.route('/', methods=['POST'])
def add_case():
    data = request.json or {}

    client_name = data.get('client_name') or 'Valued Client'
    title = data.get('title') or data.get('case_title') or 'New Legal Matter'
    
    # If client didn't supply an official case number yet, auto-generate docket ID
    case_number = data.get('case_number')
    if not case_number:
        count = Case.query.count() + 1
        year = datetime.now().year
        case_number = f"REQ/{year}/{count:04d}"

    # Verify uniqueness of case number
    existing = Case.query.filter_by(case_number=case_number).first()
    if existing:
        import time
        case_number = f"{case_number}-{int(time.time()) % 1000}"

    try:
        total_fee = float(data.get('total_fee') or 0.0)
        paid_amount = float(data.get('paid_amount') or 0.0)
        
        status_calc = 'Pending'
        if total_fee > 0:
            if paid_amount >= total_fee:
                status_calc = 'Paid'
            elif paid_amount > 0:
                status_calc = 'Partial'

        case = Case(
            case_number    = case_number,
            title          = title,
            client_name    = client_name,
            client_phone   = data.get('client_phone'),
            client_email   = data.get('client_email'),
            case_type      = data.get('case_type', 'Civil'),
            court          = data.get('court', 'District & Sessions Court'),
            status         = data.get('status', 'Active'),
            description    = data.get('description'),
            total_fee      = total_fee,
            paid_amount    = paid_amount,
            payment_status = status_calc,
            client_notes   = data.get('client_notes') or data.get('description'),
            lawyer_id      = data.get('lawyer_id'),
            client_id      = data.get('client_id')
        )
        db.session.add(case)
        db.session.commit()

        # If an initial payment was recorded at case creation
        if paid_amount > 0:
            initial_payment = Payment(
                case_id=case.id,
                amount=paid_amount,
                payment_method=data.get('payment_method', 'Bank Transfer'),
                reference_no=data.get('reference_no', 'INITIAL-RETAINER'),
                notes='Initial retainer deposit'
            )
            db.session.add(initial_payment)
            db.session.commit()

        return jsonify(case.to_dict()), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to create case: {str(e)}'}), 500


@cases_bp.route('/<int:case_id>', methods=['PUT'])
def update_case(case_id):
    case = Case.query.get_or_404(case_id)
    data = request.json or {}

    fields = [
        'title', 'client_name', 'client_phone', 'client_email',
        'case_type', 'court', 'status', 'description',
        'lawyer_id', 'client_id', 'client_notes'
    ]

    for field in fields:
        if field in data:
            setattr(case, field, data[field])

    if 'total_fee' in data:
        case.total_fee = float(data['total_fee'] or 0.0)

    if 'paid_amount' in data:
        case.paid_amount = float(data['paid_amount'] or 0.0)

    # Recalculate payment status
    if case.total_fee > 0:
        if case.paid_amount >= case.total_fee:
            case.payment_status = 'Paid'
        elif case.paid_amount > 0:
            case.payment_status = 'Partial'
        else:
            case.payment_status = 'Pending'

    try:
        db.session.commit()
        return jsonify(case.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to update case: {str(e)}'}), 500


@cases_bp.route('/<int:case_id>', methods=['DELETE'])
def delete_case(case_id):
    case = Case.query.get_or_404(case_id)
    try:
        db.session.delete(case)
        db.session.commit()
        return jsonify({'message': 'Case deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to delete case: {str(e)}'}), 500


# ── Payment Transactions Endpoints ──────────────────────────────────────────

@cases_bp.route('/<int:case_id>/payments', methods=['POST'])
def add_payment(case_id):
    case = Case.query.get_or_404(case_id)
    data = request.json or {}

    try:
        amount = float(data.get('amount') or 0.0)
        if amount <= 0:
            return jsonify({'error': 'Payment amount must be greater than 0'}), 400

        payment = Payment(
            case_id        = case.id,
            amount         = amount,
            payment_method = data.get('payment_method', 'UPI'),
            reference_no   = data.get('reference_no') or f"PAY-{int(datetime.now().timestamp())}",
            notes          = data.get('notes', 'Client fee payment')
        )
        db.session.add(payment)

        # Update case balance
        case.paid_amount = float(case.paid_amount or 0.0) + amount
        if case.total_fee > 0:
            if case.paid_amount >= case.total_fee:
                case.payment_status = 'Paid'
            else:
                case.payment_status = 'Partial'

        db.session.commit()
        return jsonify({
            'message': 'Payment recorded successfully',
            'payment': payment.to_dict(),
            'case': case.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to record payment: {str(e)}'}), 500


@cases_bp.route('/<int:case_id>/payments', methods=['GET'])
def get_payments(case_id):
    case = Case.query.get_or_404(case_id)
    payments = Payment.query.filter_by(case_id=case.id).order_by(Payment.payment_date.desc()).all()
    return jsonify([p.to_dict() for p in payments]), 200


@cases_bp.route('/payments/summary', methods=['GET'])
def get_payment_summary():
    user_id = request.args.get('user_id', type=int)
    role = request.args.get('role', '')

    query = Case.query
    if role == 'client' and user_id:
        query = query.filter(Case.client_id == user_id)
    elif role == 'lawyer' and user_id:
        query = query.filter(Case.lawyer_id == user_id)

    cases = query.all()
    total_billed = sum(c.total_fee or 0.0 for c in cases)
    total_paid   = sum(c.paid_amount or 0.0 for c in cases)
    total_due    = max(0.0, total_billed - total_paid)

    return jsonify({
        'total_billed': total_billed,
        'total_paid':   total_paid,
        'total_due':    total_due,
        'cases_count':  len(cases)
    }), 200


@cases_bp.route('/stats', methods=['GET'])
def get_stats():
    user_id = request.args.get('user_id', type=int)
    role = request.args.get('role', '')

    query = Case.query
    if role == 'client' and user_id:
        query = query.filter(Case.client_id == user_id)
    elif role == 'lawyer' and user_id:
        query = query.filter(Case.lawyer_id == user_id)

    total    = query.count()
    active   = query.filter_by(status='Active').count()
    disposed = query.filter_by(status='Disposed').count()
    civil    = query.filter_by(case_type='Civil').count()
    criminal = query.filter_by(case_type='Criminal').count()
    revenue  = query.filter_by(case_type='Revenue').count()

    total_billed = sum((c.total_fee or 0.0) for c in query.all())
    total_paid   = sum((c.paid_amount or 0.0) for c in query.all())
    total_due    = max(0.0, total_billed - total_paid)

    return jsonify({
        'total': total, 'active': active, 'disposed': disposed,
        'civil': civil, 'criminal': criminal, 'revenue': revenue,
        'total_billed': total_billed,
        'total_paid': total_paid,
        'total_due': total_due
    }), 200
