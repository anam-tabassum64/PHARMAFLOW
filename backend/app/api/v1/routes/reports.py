from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.schemas.report import (
    ExpiryReportResponse,
    MedicineStockReportItem,
    MovementReportResponse,
)
from app.services.report_service import ReportService

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.get(
    "/stock",
    response_model=List[MedicineStockReportItem],
    summary="Stock valuation and batch audit report",
)
def get_stock_report(db: Session = Depends(get_db)):
    service = ReportService(db)
    return service.get_stock_report()


@router.get(
    "/expiry",
    response_model=ExpiryReportResponse,
    summary="Expiry risk stratification report",
)
def get_expiry_report(db: Session = Depends(get_db)):
    service = ReportService(db)
    return service.get_expiry_report()


@router.get(
    "/movements",
    response_model=MovementReportResponse,
    summary="Movement history & audit summary",
)
def get_movement_report(db: Session = Depends(get_db)):
    service = ReportService(db)
    return service.get_movement_report()
