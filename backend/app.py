from flask import Flask, send_from_directory, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from models import db, User, Case, Payment
from reminders import mail, init_scheduler
from routes.cases import cases_bp
from routes.hearings import hearings_bp
from routes.documents import documents_bp
from routes.auth import auth_bp
import os
import sqlite3
from datetime import datetime

# Load environment variables from backend/.env
base_backend_dir = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(base_backend_dir, '.env'))

def init_db_schema(app):
    """Safely initialize tables and apply column migrations without errors"""
    with app.app_context():
        # Ensure all models are registered
        db.create_all()
        
        # SQLite schema safety check to ensure new columns exist in existing DB
        db_path = os.path.join(app.instance_path, 'lextrack_fresh.db')
        if os.path.exists(db_path):
            try:
                conn = sqlite3.connect(db_path)
                c = conn.cursor()
                
                # Check users columns
                c.execute("PRAGMA table_info(users)")
                user_cols = [col[1] for col in c.fetchall()]
                if 'phone' not in user_cols:
                    c.execute("ALTER TABLE users ADD COLUMN phone TEXT")
                if 'specialization' not in user_cols:
                    c.execute("ALTER TABLE users ADD COLUMN specialization TEXT")
                    
                # Check cases columns
                c.execute("PRAGMA table_info(cases)")
                case_cols = [col[1] for col in c.fetchall()]
                if 'total_fee' not in case_cols:
                    c.execute("ALTER TABLE cases ADD COLUMN total_fee REAL DEFAULT 0.0")
                if 'paid_amount' not in case_cols:
                    c.execute("ALTER TABLE cases ADD COLUMN paid_amount REAL DEFAULT 0.0")
                if 'payment_status' not in case_cols:
                    c.execute("ALTER TABLE cases ADD COLUMN payment_status TEXT DEFAULT 'Pending'")
                if 'client_notes' not in case_cols:
                    c.execute("ALTER TABLE cases ADD COLUMN client_notes TEXT")
                    
                conn.commit()
                conn.close()
            except Exception as e:
                print(f"[DB MIGRATION WARNING] {e}")


def seed_initial_data(app):
    """Auto-seed Admin Lawyer, Demo Client, and starter matters if empty"""
    with app.app_context():
        # 1. Admin Lawyer from .env
        admin_name = os.getenv('ADMIN_LAWYER_NAME', 'Adv. Praveen Kumar Gupta')
        admin_email = os.getenv('ADMIN_LAWYER_EMAIL', 'praveen.gupta@court.in').strip().lower()
        admin_pass = os.getenv('ADMIN_LAWYER_PASSWORD', 'LawyerAdmin@2026')
        admin_phone = os.getenv('ADMIN_LAWYER_PHONE', '+91 98765 43210')
        admin_spec = os.getenv('ADMIN_LAWYER_SPECIALIZATION', 'Senior Advocate • District & Sessions Court')

        lawyer = User.query.filter_by(email=admin_email).first()
        if not lawyer:
            lawyer = User(
                name=admin_name,
                email=admin_email,
                password=admin_pass,
                role='lawyer',
                phone=admin_phone,
                specialization=admin_spec
            )
            db.session.add(lawyer)
            db.session.commit()
            print(f"[SEED] Configured Main Admin Lawyer: {admin_email}")

        # 2. Demo Client from .env
        client_name = os.getenv('DEMO_CLIENT_NAME', 'Rajesh Sharma')
        client_email = os.getenv('DEMO_CLIENT_EMAIL', 'client.sharma@example.com').strip().lower()
        client_pass = os.getenv('DEMO_CLIENT_PASSWORD', 'Client@2026')
        client_phone = os.getenv('DEMO_CLIENT_PHONE', '+91 91234 56789')

        client = User.query.filter_by(email=client_email).first()
        if not client:
            client = User(
                name=client_name,
                email=client_email,
                password=client_pass,
                role='client',
                phone=client_phone
            )
            db.session.add(client)
            db.session.commit()
            print(f"[SEED] Configured Demo Client: {client_email}")

        # 3. Seed starter demo cases if chamber docket is empty
        if Case.query.count() == 0:
            case1 = Case(
                case_number='CC/1234/2024',
                title='Sharma vs. State of Delhi',
                client_name=client.name,
                client_phone=client.phone,
                client_email=client.email,
                case_type='Civil',
                court='District Court, Tis Hazari (Courtroom 3)',
                status='Active',
                total_fee=50000.0,
                paid_amount=20000.0,
                payment_status='Partial',
                client_notes='Dispute regarding municipal road widening notice on ancestral property. Seeking urgent injunction and stay of demolition order.',
                description='Civil property injunction petition filed against municipal corporation.',
                lawyer_id=lawyer.id,
                client_id=client.id
            )
            db.session.add(case1)
            db.session.commit()

            pay1 = Payment(
                case_id=case1.id,
                amount=20000.0,
                payment_method='UPI',
                reference_no='UPI-992384102',
                notes='Initial case filing and court fee advance'
            )
            db.session.add(pay1)

            case2 = Case(
                case_number='OS/502/2025',
                title='Gupta Traders vs. Metro Infra Ltd',
                client_name='Sunita Verma',
                client_phone='+91 98112 34567',
                client_email='sunita.verma@example.com',
                case_type='Civil',
                court='Commercial Court Bench, Delhi',
                status='Active',
                total_fee=75000.0,
                paid_amount=75000.0,
                payment_status='Paid',
                client_notes='Recovery of Rs. 14,50,000 against bounced security cheques and pending material invoices.',
                description='Commercial summary suit for commercial dues recovery under Order 37 CPC.',
                lawyer_id=lawyer.id,
                client_id=client.id
            )
            db.session.add(case2)
            db.session.commit()

            pay2 = Payment(
                case_id=case2.id,
                amount=75000.0,
                payment_method='Bank Transfer',
                reference_no='NEFT-88392101',
                notes='Full legal retainer fee cleared'
            )
            db.session.add(pay2)
            db.session.commit()

            from models import Hearing
            from datetime import date, timedelta
            h1 = Hearing(
                case_id=case1.id,
                hearing_date=date.today(),
                hearing_time='10:30 AM',
                purpose='Arguments on Temporary Injunction Application (Order 39 CPC)'
            )
            h2 = Hearing(
                case_id=case2.id,
                hearing_date=date.today() + timedelta(days=2),
                hearing_time='02:15 PM',
                purpose='Commercial Cheque Counterfoil & Evidence Verification'
            )
            db.session.add(h1)
            db.session.add(h2)
            db.session.commit()
            print("[SEED] Seeded initial active docket matters, hearings, and payment ledger.")

        # Ensure hearings exist for hearing reminder alerts
        from models import Hearing
        if Hearing.query.count() == 0:
            first_case = Case.query.first()
            if first_case:
                from datetime import date, timedelta
                h1 = Hearing(
                    case_id=first_case.id,
                    hearing_date=date.today(),
                    hearing_time='10:30 AM',
                    purpose='Urgent Hearing: Arguments on Stay Application'
                )
                h2 = Hearing(
                    case_id=first_case.id,
                    hearing_date=date.today() + timedelta(days=2),
                    hearing_time='02:15 PM',
                    purpose='Framing of Issues & Case Management'
                )
                db.session.add(h1)
                db.session.add(h2)
                db.session.commit()
                print("[SEED] Seeded upcoming hearing reminders.")


def create_app():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    static_dir = os.path.join(base_dir, 'frontend', 'dist')
    app = Flask(__name__, static_folder=static_dir, static_url_path='')
    
    # Allow credentials for authenticated API calls
    CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

    # ── Config ───────────────────────────────────────────────────────────────
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'lex_track_secure_2026_key')

    db_url = os.getenv('DATABASE_URL', 'sqlite:///lextrack_fresh.db')
    if db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql://", 1)
        
    app.config['SQLALCHEMY_DATABASE_URI']        = db_url
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['UPLOAD_FOLDER']                  = os.path.join(os.getcwd(), 'uploads')
    app.config['MAX_CONTENT_LENGTH']             = 16 * 1024 * 1024  # 16 MB

    # Mail config (set your SMTP in .env)
    app.config['MAIL_SERVER']         = os.getenv('MAIL_SERVER', 'smtp.gmail.com')
    app.config['MAIL_PORT']           = int(os.getenv('MAIL_PORT', 587))
    app.config['MAIL_USE_TLS']        = True
    app.config['MAIL_USERNAME']       = os.getenv('MAIL_USERNAME')
    app.config['MAIL_PASSWORD']       = os.getenv('MAIL_PASSWORD')
    app.config['MAIL_DEFAULT_SENDER'] = os.getenv('MAIL_USERNAME')

    # ── Init extensions ──────────────────────────────────────────────────────
    db.init_app(app)
    mail.init_app(app)

    # ── Register blueprints ──────────────────────────────────────────────────
    app.register_blueprint(auth_bp,      url_prefix='/api/auth')
    app.register_blueprint(cases_bp,     url_prefix='/api/cases')
    app.register_blueprint(hearings_bp,  url_prefix='/api/cases')
    app.register_blueprint(documents_bp, url_prefix='/api/cases')

    # Standalone hearing routes
    from routes.hearings import upcoming_hearings, cause_list
    app.add_url_rule('/api/hearings/upcoming',   view_func=upcoming_hearings)
    app.add_url_rule('/api/hearings/cause-list', view_func=cause_list)

    # ── Create tables & seed data ───────────────────────────────────────────
    init_db_schema(app)
    seed_initial_data(app)

    # ── Start scheduler ──────────────────────────────────────────────────────
    init_scheduler(app)

    @app.route('/api/health')
    def health():
        return {'status': 'ok', 'app': 'LexTrack', 'database': app.config['SQLALCHEMY_DATABASE_URI']}

    @app.route('/')
    def serve_index():
        index_path = os.path.join(app.static_folder, 'index.html')
        if os.path.exists(index_path):
            return send_from_directory(app.static_folder, 'index.html')
        return {"status": "success", "message": "Legal Case Manager Backend is running. Frontend not built yet."}

    @app.errorhandler(404)
    def not_found(error):
        index_path = os.path.join(app.static_folder, 'index.html')
        if os.path.exists(index_path):
            return send_from_directory(app.static_folder, 'index.html')
        return jsonify({'error': 'Not found'}), 404

    return app


if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5000)
