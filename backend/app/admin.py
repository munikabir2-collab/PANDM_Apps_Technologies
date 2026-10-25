from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parents[1] / ".env", override=False)
import hmac
import os

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from pydantic import BaseModel
from sqlalchemy.orm import Session

from .database import get_db
from . import models, schemas

router = APIRouter(prefix="/api/admin", tags=["Admin"])
security = HTTPBasic(auto_error=False)


def require_admin(
    credentials: HTTPBasicCredentials | None = Depends(security),
):
    expected_user = os.getenv("ADMIN_USERNAME", "")
    expected_password = os.getenv("ADMIN_PASSWORD", "")

    if not expected_user or not expected_password:
        raise HTTPException(
            status_code=503,
            detail="Admin credentials are not configured on the server.",
        )

    if credentials is None:
        raise HTTPException(
            status_code=401,
            detail="Admin login required.",
            headers={"WWW-Authenticate": "Basic"},
        )

    user_ok = hmac.compare_digest(
        credentials.username.encode("utf-8"),
        expected_user.encode("utf-8"),
    )
    password_ok = hmac.compare_digest(
        credentials.password.encode("utf-8"),
        expected_password.encode("utf-8"),
    )

    if not (user_ok and password_ok):
        raise HTTPException(
            status_code=401,
            detail="Invalid admin username or password.",
            headers={"WWW-Authenticate": "Basic"},
        )

    return credentials.username


class BookingStatusUpdate(BaseModel):
    status: str


@router.get("/bookings", response_model=list[schemas.BookingOut])
def admin_bookings(
    _: str = Depends(require_admin),
    db: Session = Depends(get_db),
):
    return (
        db.query(models.ProjectBooking)
        .order_by(models.ProjectBooking.id.desc())
        .limit(500)
        .all()
    )


@router.get("/contacts", response_model=list[schemas.ContactOut])
def admin_contacts(
    _: str = Depends(require_admin),
    db: Session = Depends(get_db),
):
    return (
        db.query(models.ContactMessage)
        .order_by(models.ContactMessage.id.desc())
        .limit(500)
        .all()
    )


@router.patch("/bookings/{booking_id}/status")
def update_booking_status(
    booking_id: int,
    payload: BookingStatusUpdate,
    _: str = Depends(require_admin),
    db: Session = Depends(get_db),
):
    allowed = {"new", "contacted", "in_progress", "completed", "cancelled"}

    if payload.status not in allowed:
        raise HTTPException(
            status_code=422,
            detail=f"Status must be one of: {', '.join(sorted(allowed))}",
        )

    booking = db.get(models.ProjectBooking, booking_id)
    if booking is None:
        raise HTTPException(status_code=404, detail="Booking not found.")

    booking.status = payload.status
    db.commit()
    db.refresh(booking)

    return {"success": True, "id": booking.id, "status": booking.status}

