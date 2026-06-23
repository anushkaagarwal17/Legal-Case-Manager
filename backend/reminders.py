from apscheduler.schedulers.background import BackgroundScheduler
from flask_mail import Mail, Message
from models import db, Hearing, Case
from datetime import date, timedelta

mail = Mail()

def send_reminder(app, hearing_id):
    with app.app_context():
        hearing = Hearing.query.get(hearing_id)
        if not hearing or hearing.reminder_sent:
            return
        case = hearing.case
        if not case.client_email:
            return
        msg = Message(
            subject    = f'[LexTrack] Hearing Reminder — {case.case_number}',
            recipients = [case.client_email],
            body       = f"""Dear {case.client_name},

This is a reminder for your upcoming court hearing:

Case:   {case.title} ({case.case_number})
Court:  {case.court}
Date:   {hearing.hearing_date.strftime('%d %B %Y')}
Time:   {hearing.hearing_time}
Purpose: {hearing.purpose or 'As scheduled'}

Please ensure all required documents are ready.

Regards,
Adv. Chamber — LexTrack System"""
        )
        try:
            mail.send(msg)
            hearing.reminder_sent = True
            db.session.commit()
        except Exception as e:
            print(f'Reminder error: {e}')


def check_and_send_reminders(app):
    with app.app_context():
        tomorrow = date.today() + timedelta(days=1)
        hearings = Hearing.query.filter_by(hearing_date=tomorrow, reminder_sent=False).all()
        for h in hearings:
            send_reminder(app, h.id)


def init_scheduler(app):
    scheduler = BackgroundScheduler()
    scheduler.add_job(
        func     = lambda: check_and_send_reminders(app),
        trigger  = 'cron',
        hour     = 8,
        minute   = 0,
        id       = 'daily_reminders',
        replace_existing = True,
    )
    scheduler.start()
    return scheduler