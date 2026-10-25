# PANDM Apps Technologies

Full-stack starter website built with **React + Vite** (frontend) and **FastAPI** (backend), with PostgreSQL-ready configuration.

## Features
- Home / company introduction
- App Development
- AI Agent
- Voice Control
- Website Development
- Portfolio
- Customer Account (starter form)
- Project Booking (saved through FastAPI)
- Contact form (saved through FastAPI)
- English / Hindi language toggle
- Responsive layout

## Requirements
- Python 3.11+
- Node.js 20+
- PostgreSQL (optional for local quick start; SQLite is used if `DATABASE_URL` is not configured)

## Start backend (Windows PowerShell)
```powershell
cd .\backend
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
Copy-Item .env.example .env
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
API docs: http://127.0.0.1:8000/docs

## Start frontend (new PowerShell window)
```powershell
cd .\frontend
npm install
Copy-Item .env.example .env
npm run dev
```
Open the URL Vite prints (usually http://localhost:5173).

## PostgreSQL
Edit `backend/.env` and set:
`DATABASE_URL=postgresql+psycopg://postgres:YOUR_PASSWORD@localhost:5432/pandm_apps_technologies`
Create that database in PostgreSQL first. Never commit real passwords or API keys.

## Production build
```powershell
cd .\frontend
npm run build
```
Deploy the backend and frontend separately. Set `FRONTEND_ORIGINS` on the backend to your deployed frontend origin.
