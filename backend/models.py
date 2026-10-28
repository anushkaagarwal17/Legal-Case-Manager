from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    id             = db.Column(db.Integer, primary_key=True)
    name           = db.Column(db.String(100), nullable=False)
    email          = db.Column(db.String(120), unique=True, nullable=False)
    password       = db.Column(db.String(200), nullable=False)
    role           = db.Column(db.String(20), nullable=False, default='client')  # 'lawyer' or 'client'
    phone          = db.Column(db.String(20), nullable=True)
    specialization = db.Column(db.String(150), nullable=True)
    created_at     = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    lawyer_cases = db.relationship('Case', foreign_keys='Case.lawyer_id', backref='lawyer', lazy=True)
    client_cases = db.relationship('Case', foreign_keys='Case.client_id', backref='client', lazy=True)

    def to_dict(self):
        return {
            'id':             self.id,
            'name':           self.name,
            'email':          self.email,
            'role':           self.role,
            'phone':          self.phone,
            'specialization': self.specialization,
            'created_at':     self.created_at.isoformat() if self.created_at else None
        }


class Case(db.Model):
    __tablename__ = 'cases'
    id           = db.Column(db.Integer, primary_key=True)
    case_number  = db.Column(db.String(100), unique=True, nullable=False)
    title        = db.Column(db.String(300), nullable=False)
    client_name  = db.Column(db.String(200), nullable=False)
    client_phone = db.Column(db.String(20))
    client_email = db.Column(db.String(200))
    case_type    = db.Column(db.String(50), default='Civil')
    court        = db.Column(db.String(200), nullable=True)
    status       = db.Column(db.String(50), default='Active')  # Active / Disposed / Review / Pending
    description  = db.Column(db.Text)
    
    # Financial & Fee Tracking
    total_fee      = db.Column(db.Float, default=0.0)      # Agreed case fee
    paid_amount    = db.Column(db.Float, default=0.0)      # Amount received from client
    payment_status = db.Column(db.String(50), default='Pending') # Paid / Partial / Pending
    client_notes   = db.Column(db.Text, nullable=True)     # What the client wants / relief sought

    # Dual Portal Links
    lawyer_id    = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    client_id    = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)

    created_at   = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at   = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    hearings  = db.relationship('Hearing',  backref='case', lazy=True, cascade='all, delete-orphan')
    documents = db.relationship('Document', backref='case', lazy=True, cascade='all, delete-orphan')
    memos     = db.relationship('LegalMemo', backref='case', lazy=True, cascade='all, delete-orphan')
    payments  = db.relationship('Payment',   backref='case', lazy=True, cascade='all, delete-orphan', order_by='Payment.payment_date.desc()')

    def to_dict(self):
        total = float(self.total_fee or 0.0)
        paid = float(self.paid_amount or 0.0)
        balance = max(0.0, total - paid)
        
        status_calc = self.payment_status
        if total > 0:
            if paid >= total:
                status_calc = 'Paid'
            elif paid > 0:
                status_calc = 'Partial'
            else:
                status_calc = 'Pending'

        return {
            'id':                self.id,
            'case_number':       self.case_number,
            'title':             self.title,
            'client_name':       self.client_name,
            'client_phone':      self.client_phone,
            'client_email':      self.client_email,
            'case_type':         self.case_type,
            'court':             self.court,
            'status':            self.status,
            'description':       self.description,
            'total_fee':         total,
            'paid_amount':       paid,
            'remaining_balance': balance,
            'payment_status':    status_calc,
            'client_notes':      self.client_notes,
            'lawyer_id':         self.lawyer_id,
            'client_id':         self.client_id,
            'lawyer_name':       self.lawyer.name if self.lawyer else None,
            'created_at':        self.created_at.isoformat() if self.created_at else None,
            'updated_at':        self.updated_at.isoformat() if self.updated_at else None,
            'hearings':          [h.to_dict() for h in self.hearings],
            'documents':         [d.to_dict() for d in self.documents],
            'memos':             [m.to_dict() for m in self.memos],
            'payments':          [p.to_dict() for p in self.payments]
        }


class Payment(db.Model):
    __tablename__ = 'payments'
    id             = db.Column(db.Integer, primary_key=True)
    case_id        = db.Column(db.Integer, db.ForeignKey('cases.id'), nullable=False)
    amount         = db.Column(db.Float, nullable=False)
    payment_date   = db.Column(db.Date, default=datetime.utcnow)
    payment_method = db.Column(db.String(50), default='UPI')  # UPI / Bank Transfer / Cash / Cheque
    reference_no   = db.Column(db.String(100), nullable=True) # Transaction ID or Receipt No
    notes          = db.Column(db.String(300), nullable=True)
    created_at     = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id':             self.id,
            'case_id':        self.case_id,
            'amount':         float(self.amount),
            'payment_date':   self.payment_date.isoformat() if self.payment_date else None,
            'payment_method': self.payment_method,
            'reference_no':   self.reference_no,
            'notes':          self.notes,
            'created_at':     self.created_at.isoformat() if self.created_at else None
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
            'case_number':   self.case.case_number if self.case else None,
            'title':         self.case.title if self.case else None,
            'client_name':   self.case.client_name if self.case else None,
            'court':         self.case.court if self.case else None,
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
            'uploaded_at': self.uploaded_at.isoformat() if self.uploaded_at else None,
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
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
