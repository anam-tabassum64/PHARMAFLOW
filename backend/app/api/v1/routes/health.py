from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.core.config import settings
from app.database.connection import get_db

router = APIRouter(tags=["Health"])


@router.get("/health", summary="Service Liveness Probe")
def health_check():
    """
    Standard Kubernetes/Docker liveness probe.
    Returns 200 OK if the application process is running.
    """
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@router.get("/ready", summary="Service Readiness Probe")
def readiness_check(db: Session = Depends(get_db)):
    """
    Standard Kubernetes/Docker readiness probe.
    Verifies live database connectivity before routing traffic.
    """
    try:
        db.execute(text("SELECT 1"))
        return {
            "status": "ready",
            "database": "connected",
            "version": settings.VERSION,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Database readiness probe failed: {str(exc)}",
        )
