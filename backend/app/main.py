from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from .config import settings
from .database import Base, engine, get_db
from . import models, schemas
from .admin import router as admin_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield

app = FastAPI(title=settings.app_name, version="1.0.0", lifespan=lifespan)
origins = [x.strip() for x in settings.frontend_origins.split(",") if x.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "OPTIONS"],
    allow_headers=["*"],
)

SERVICES = [
    {"id": "app-development", "name": "App Development", "description": "Android and cross-platform mobile applications."},
    {"id": "ai-agent", "name": "AI Agent", "description": "AI-powered assistants and business workflows."},
    {"id": "voice-control", "name": "Voice Control", "description": "Voice-driven applications and automation."},
    {"id": "website-development", "name": "Website Development", "description": "Responsive websites and full-stack web apps."},
    {"id": "docker-deployment", "name": "Docker Support & Deployment", "description": "Docker, Docker Compose, containerization and application deployment support."},
]

@app.get("/")
def root():
    return {"status": "success", "message": "PANDM Apps Technologies API"}

@app.get("/api/health")
def health():
    return {"status": "ok", "service": settings.app_name}

@app.get("/api/services")
def list_services():
    return SERVICES

@app.post("/api/bookings", response_model=schemas.BookingOut, status_code=201)
def create_booking(payload: schemas.BookingCreate, db: Session = Depends(get_db)):
    booking = models.ProjectBooking(**payload.model_dump())
    db.add(booking)
    db.commit()
    db.refresh(booking)
    return booking

@app.get("/api/bookings", response_model=list[schemas.BookingOut])
def list_bookings(
    _: str = Depends(__import__("app.admin", fromlist=["require_admin"]).require_admin),
    db: Session = Depends(get_db),
):
    return db.query(models.ProjectBooking).order_by(models.ProjectBooking.id.desc()).limit(100).all()

@app.post("/api/contact", response_model=schemas.ContactOut, status_code=201)
def create_contact(payload: schemas.ContactCreate, db: Session = Depends(get_db)):
    message = models.ContactMessage(**payload.model_dump())
    db.add(message)
    db.commit()
    db.refresh(message)
    return message


app.include_router(admin_router)


