# LexTrack — AI-Powered Legal Case Management System

> Built as a real-world internship project under Adv. Praveen Kumar Gupta, District Court, Agra.

## Features
- Case Dashboard with live stats
- Add / Search / Filter cases (Civil, Criminal, Revenue)
- Hearing tracker with timeline view
- Email reminders (auto-sent day before hearing)
- Document upload per case
- AI Legal Memo Generator (powered by Claude)
- Printable Cause List
- Upcoming hearings with urgency indicators

## Tech Stack
| Layer    | Tech                          |
|----------|-------------------------------|
| Frontend | React + Vite                  |
| Backend  | Python Flask                  |
| Database | SQLite (local) / PostgreSQL (prod) |
| AI       | Anthropic Claude API          |
| Email    | Flask-Mail + Gmail SMTP       |
| Scheduler| APScheduler                   |
| Deploy   | Vercel (frontend) + Render (backend) |

---

## Local Setup

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env           # Fill in your keys
python app.py
```
Backend runs at: http://localhost:5000

### Frontend
```bash
cd frontend
npm install
cp .env.example .env.local     # Set VITE_API_URL
npm run dev
```
Frontend runs at: http://localhost:5173

---

## Deployment

### Backend → Render
1. Push `backend/` folder to GitHub
2. Create new Web Service on Render
3. Set build: `pip install -r requirements.txt`
4. Set start: `gunicorn "app:create_app()"`
5. Add env vars from `.env.example`

### Frontend → Vercel
1. Push `frontend/` folder to GitHub
2. Import on Vercel
3. Set `VITE_API_URL` to your Render backend URL
4. Deploy

---

## Project Structure
```
lextrack/
├── backend/
│   ├── app.py           # Flask app factory
│   ├── models.py        # SQLAlchemy models
│   ├── reminders.py     # Email + scheduler
│   ├── routes/
│   │   ├── cases.py     # CRUD + stats
│   │   ├── hearings.py  # Hearings + cause list
│   │   └── documents.py # Upload + AI memo
│   └── requirements.txt
└── frontend/
    └── src/
        ├── App.jsx
        ├── api.js
        ├── components/Sidebar.jsx
        └── pages/
            ├── Dashboard.jsx
            ├── Cases.jsx
            ├── AddCase.jsx
            ├── CaseDetail.jsx
            ├── CauseList.jsx
            └── Upcoming.jsx
```

---

## About
This system was developed as part of a Legal Technology Internship at the chamber of
Adv. Praveen Kumar Gupta, District Court, Agra (June–July 2026).
The tool replaced manual case registers and is actively used by the chamber.