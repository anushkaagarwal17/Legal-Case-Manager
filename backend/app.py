from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
from models import db
from reminders import mail, init_scheduler
from routes.cases import cases_bp
from routes.hearings import hearings_bp
from routes.documents import documents_bp
import os

load_dotenv()

def create_app():
    app = Flask(__name__)
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # ── Config ───────────────────────────────────────────────────────────────
    app.config['SQLALCHEMY_DATABASE_URI']        = os.getenv('DATABASE_URL', 'sqlite:///lextrack.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['UPLOAD_FOLDER']                  = os.path.join(os.getcwd(), 'uploads')
    app.config['MAX_CONTENT_LENGTH']             = 16 * 1024 * 1024  # 16 MB

    # Mail config (set your SMTP in .env)
    app.config['MAIL_SERVER']   = os.getenv('MAIL_SERVER', 'smtp.gmail.com')
    app.config['MAIL_PORT']     = int(os.getenv('MAIL_PORT', 587))
    app.config['MAIL_USE_TLS']  = True
    app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
    app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
    app.config['MAIL_DEFAULT_SENDER'] = os.getenv('MAIL_USERNAME')

    # ── Init extensions ──────────────────────────────────────────────────────
    db.init_app(app)
    mail.init_app(app)

    # ── Register blueprints ──────────────────────────────────────────────────
    app.register_blueprint(cases_bp,     url_prefix='/api/cases')
    app.register_blueprint(hearings_bp,  url_prefix='/api/cases')
    app.register_blueprint(documents_bp, url_prefix='/api/cases')

    # Standalone hearing routes
    from routes.hearings import upcoming_hearings, cause_list
    app.add_url_rule('/api/hearings/upcoming',   view_func=upcoming_hearings)
    app.add_url_rule('/api/hearings/cause-list', view_func=cause_list)

    # ── Create tables ────────────────────────────────────────────────────────
    with app.app_context():
        db.create_all()
        os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

    # ── Start scheduler ──────────────────────────────────────────────────────
    init_scheduler(app)

    @app.route('/api/health')
    def health():
        return {'status': 'ok', 'app': 'LexTrack'}
    
    @app.route('/')
    def home():
        return {"status": "success", "message": "Legal Case Manager Backend is running smoothly!"}

    return app


if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5000)
    