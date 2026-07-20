from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    id         = db.Column(db.Integer, primary_key=True)
    name       = db.Column(db.String(100), nullable=False)
    email      = db.Column(db.String(120), unique=True, nullable=False)
    password   = db.Column(db.String(200), nullable=False)
    role       = db.Column(db.String(20), nullable=False, default='client')  # 'lawyer' or 'client'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    lawyer_cases = db.relationship('Case', foreign_keys='Case.lawyer_id', backref='lawyer', lazy=True)
    client_cases = db.relationship('Case', foreign_keys='Case.client_id', backref='client', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'role': self.role
        }


class Case(db.Model):
    __tablename__ = 'cases'
    id           = db.Column(db.Integer, primary_key=True)
    case_number  = db.Column(db.String(100), unique=True, nullable=False)
    title        = db.Column(db.String(300), nullable=False)
    client_name  = db.Column(db.String(200), nullable=False)
    client_phone = db.Column(db.String(20))
    client_email = db.Column(db.String(200))
    case_type    = db.Column(db.String(50), default='Civil')   # Made default='Civil'
    court        = db.Column(db.String(200), nullable=True)     # Changed nullable=True to prevent submit crash
    status       = db.Column(db.String(50), default='Active')  # Active / Disposed / Stayed
    description  = db.Column(db.Text)
    ai_summary   = db.Column(db.Text)                           # New: Stores Gemini AI Case Insights
    
    # Dual Portal Links
    lawyer_id    = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    client_id    = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)

    created_at   = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at   = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    hearings  = db.relationship('Hearing',  backref='case', lazy=True, cascade='all, delete-orphan')
    documents = db.relationship('Document', backref='case', lazy=True, cascade='all, delete-orphan')
    memos     = db.relationship('LegalMemo', backref='case', lazy=True, cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id':           self.id,
            'case_number':  self.case_number,
            'title':        self.title,
            'client_name':  self.client_name,
            'client_phone': self.client_phone,
            'client_email': self.client_email,
            'case_type':    self.case_type,
            'court':        self.court,
            'status':       self.status,
            'description':  self.description,
            'ai_summary':   self.ai_summary,
            'lawyer_id':    self.lawyer_id,
            'client_id':    self.client_id,
            'created_at':   self.created_at.isoformat(),
            'updated_at':   self.updated_at.isoformat(),
            'hearings':     [h.to_dict() for h in self.hearings],
            'documents':    [d.to_dict() for d in self.documents],
            'memos':        [m.to_dict() for m in self.memos],
        }


class Hearing(db.Model):
    __tablename__ = 'hearings'
    id            = db.Column(db.Integer, primary_key=True)
    case_id       = db.Column(db.Integer, db.ForeignKey('cases.id'), nullable=False)
    hearing_date  = db.Column(db.Date, nullable=False)
    hearing_time  = db.Column(db.String(20), default='10:30 AM')
    purpose       = db.Column(db.String(300))
    outcome       = db.Column(db.Text)
    next_date     = db.Column(db.Date)
    reminder_sent = db.Column(db.Boolean, default=False)
    created_at    = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id':            self.id,
            'case_id':       self.case_id,
            'hearing_date':  self.hearing_date.isoformat() if self.hearing_date else None,
            'hearing_time':  self.hearing_time,
            'purpose':       self.purpose,
            'outcome':       self.outcome,
            'next_date':     self.next_date.isoformat() if self.next_date else None,
            'reminder_sent': self.reminder_sent,
        }


class Document(db.Model):
    __tablename__ = 'documents'
    id          = db.Column(db.Integer, primary_key=True)
    case_id     = db.Column(db.Integer, db.ForeignKey('cases.id'), nullable=False)
    name        = db.Column(db.String(300), nullable=False)
    doc_type    = db.Column(db.String(100))
    file_path   = db.Column(db.String(500))
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id':          self.id,
            'case_id':     self.case_id,
            'name':        self.name,
            'doc_type':    self.doc_type,
            'file_path':   self.file_path,
            'uploaded_at': self.uploaded_at.isoformat(),
        }


class LegalMemo(db.Model):
    __tablename__ = 'legal_memos'
    id         = db.Column(db.Integer, primary_key=True)
    case_id    = db.Column(db.Integer, db.ForeignKey('cases.id'), nullable=False)
    query      = db.Column(db.Text, nullable=False)
    summary    = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id':         self.id,
            'case_id':    self.case_id,
            'query':      self.query,
            'summary':    self.summary,
            'created_at': self.created_at.isoformat(),
        }
