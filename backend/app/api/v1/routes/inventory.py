from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.schemas.medicine import MedicineResponse
from app.schemas.report import InventorySummaryResponse, LowStockMedicineResponse
from app.services.inventory_service import InventoryService
from app.services.medicine_service import MedicineService

router = APIRouter(prefix="/inventory", tags=["Inventory"])


@router.get("", response_model=List[MedicineResponse], summary="Get inventory stock catalogue")
def get_inventory(db: Session = Depends(get_db)):
    service = MedicineService(db)
    return service.list_medicines(skip=0, limit=500, is_active=True)


@router.get(
    "/summary",
    response_model=InventorySummaryResponse,
    summary="Get inventory KPIs summary",
)
def get_inventory_summary(db: Session = Depends(get_db)):
    service = InventoryService(db)
    return service.get_summary()


@router.get(
    "/low-stock",
    response_model=List[LowStockMedicineResponse],
    summary="List medicines below reorder level",
)
def get_low_stock(db: Session = Depends(get_db)):
    service = InventoryService(db)
    return service.get_low_stock()
