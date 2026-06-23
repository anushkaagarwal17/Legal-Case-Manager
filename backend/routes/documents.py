from flask import Blueprint, request, jsonify, current_app
from models import db, Document, LegalMemo, Case
from werkzeug.utils import secure_filename
import os, anthropic

documents_bp = Blueprint('documents', __name__)

ALLOWED_EXTENSIONS = {'pdf', 'png', 'jpg', 'jpeg', 'docx', 'txt'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


# ── Document upload ──────────────────────────────────────────────────────────

@documents_bp.route('/<int:case_id>/documents', methods=['POST'])
def upload_document(case_id):
    Case.query.get_or_404(case_id)
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    file = request.files['file']
    doc_type = request.form.get('doc_type', 'Other')

    if file and allowed_file(file.filename):
        filename  = secure_filename(file.filename)
        upload_dir = os.path.join(current_app.config['UPLOAD_FOLDER'], str(case_id))
        os.makedirs(upload_dir, exist_ok=True)
        file_path = os.path.join(upload_dir, filename)
        file.save(file_path)

        doc = Document(
            case_id   = case_id,
            name      = filename,
            doc_type  = doc_type,
            file_path = file_path,
        )
        db.session.add(doc)
        db.session.commit()
        return jsonify(doc.to_dict()), 201

    return jsonify({'error': 'File type not allowed'}), 400


@documents_bp.route('/<int:case_id>/documents', methods=['GET'])
def get_documents(case_id):
    Case.query.get_or_404(case_id)
    docs = Document.query.filter_by(case_id=case_id).order_by(Document.uploaded_at.desc()).all()
    return jsonify([d.to_dict() for d in docs])


@documents_bp.route('/documents/<int:doc_id>', methods=['DELETE'])
def delete_document(doc_id):
    doc = Document.query.get_or_404(doc_id)
    if os.path.exists(doc.file_path):
        os.remove(doc.file_path)
    db.session.delete(doc)
    db.session.commit()
    return jsonify({'message': 'Document deleted'})


# ── AI Legal Memo ────────────────────────────────────────────────────────────

@documents_bp.route('/<int:case_id>/memo', methods=['POST'])
def generate_memo(case_id):
    case = Case.query.get_or_404(case_id)
    data = request.json
    query = data.get('query', '')

    if not query:
        return jsonify({'error': 'Query is required'}), 400

    system_prompt = """You are an expert Indian legal research assistant with deep knowledge of 
Indian law including IPC, CPC, CrPC, Transfer of Property Act, Revenue Laws, and UP State laws.
Given a legal query related to a case, provide:
1. Relevant legal provisions and sections
2. Key precedents from Indian courts (Supreme Court / High Courts)
3. Suggested arguments for the advocate
4. Strategic legal advice
Keep the response concise, structured, and practically useful for a practicing advocate."""

    user_message = f"""Case: {case.title} ({case.case_number})
Type: {case.case_type} | Court: {case.court}
Client: {case.client_name}
Case Description: {case.description or 'Not provided'}

Legal Query: {query}"""

    try:
        client = anthropic.Anthropic()
        message = client.messages.create(
            model      = "claude-sonnet-4-6",
            max_tokens = 1500,
            messages   = [{"role": "user", "content": user_message}],
            system     = system_prompt,
        )
        summary = message.content[0].text

        memo = LegalMemo(case_id=case_id, query=query, summary=summary)
        db.session.add(memo)
        db.session.commit()
        return jsonify(memo.to_dict()), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@documents_bp.route('/<int:case_id>/memos', methods=['GET'])
def get_memos(case_id):
    Case.query.get_or_404(case_id)
    memos = LegalMemo.query.filter_by(case_id=case_id).order_by(LegalMemo.created_at.desc()).all()
    return jsonify([m.to_dict() for m in memos])