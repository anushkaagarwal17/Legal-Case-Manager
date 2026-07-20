from flask import Blueprint, request, jsonify
from models import db, Case
from google import genai

cases_bp = Blueprint('cases', __name__)

@cases_bp.route('/', methods=['GET'])
def get_cases():
    search = request.args.get('search', '')
    status = request.args.get('status', '')
    case_type = request.args.get('type', '')
    role = request.args.get('role', '')          # New: Filter by role
    user_id = request.args.get('user_id', type=int) # New: Filter by specific user ID

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
    if status:
        query = query.filter(Case.status == status)
    if case_type:
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

    # Safe data Extraction using .get() to prevent KeyError crashes
    case_number = data.get('case_number')
    client_name = data.get('client_name')
    
    # Handle alternative frontend key names gracefully (e.g. title vs case_title)
    title = data.get('title') or data.get('case_title') or 'Untitled Case'

    if not case_number or not client_name:
        return jsonify({'error': 'Case Number and Client Name are required fields'}), 400

    try:
        case = Case(
            case_number  = case_number,
            title        = title,
            client_name  = client_name,
            client_phone = data.get('client_phone'),
            client_email = data.get('client_email'),
            case_type    = data.get('case_type', 'Civil'),
            court        = data.get('court', 'General Court'),
            status       = data.get('status', 'Active'),
            description  = data.get('description'),
            ai_summary   = data.get('ai_summary'),
            lawyer_id    = data.get('lawyer_id'),
            client_id    = data.get('client_id')
        )
        db.session.add(case)
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
        'case_type', 'court', 'status', 'description', 'ai_summary',
        'lawyer_id', 'client_id'
    ]

    for field in fields:
        if field in data:
            setattr(case, field, data[field])

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

    return jsonify({
        'total': total, 'active': active, 'disposed': disposed,
        'civil': civil, 'criminal': criminal, 'revenue': revenue,
    }), 200

@cases_bp.route('/<int:case_id>/summarize', methods=['POST'])
def summarize_case(case_id):
    case = Case.query.get_or_404(case_id)
    data = request.json or {}
    hearing_notes = data.get('hearing_notes', '')

    api_key = os.getenv('GEMINI_API_KEY')
    if not api_key:
        return jsonify({"error": "GEMINI_API_KEY environment variable is missing in Render"}), 500

    try:
        # Initialize Gemini Client
        client = genai.Client(api_key=api_key)
        
        prompt = f"""
        You are an expert AI legal assistant. Generate a concise, clear summary of the following legal case.
        
        Case Title: {case.title}
        Client Name: {case.client_name}
        Case Description: {case.description or 'N/A'}
        Recent Hearing / Progress Notes: {hearing_notes}
        
        Provide the response in two short sections:
        1. **Client Summary:** A simple 2-sentence explanation suitable for the client in plain language.
        2. **Key Action Items:** Bullet points of immediate next steps or upcoming dates.
        """

        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt
        )

        ai_summary_text = response.text

        # Save AI summary directly to the database
        case.ai_summary = ai_summary_text
        db.session.commit()

        return jsonify({
            "status": "success",
            "summary": ai_summary_text,
            "case": case.to_dict()
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"AI Generation failed: {str(e)}"}), 500
