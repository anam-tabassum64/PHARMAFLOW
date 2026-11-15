import uuid
from typing import List, Optional

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.stock_movement import MovementType
from app.schemas.movement import (
    AdjustmentRequest,
    MovementResponse,
    PurchaseRequest,
    ReturnRequest,
    SaleRequest,
)
from app.services.movement_service import MovementService

router = APIRouter(prefix="/movements", tags=["Stock Movements"])


@router.get("", response_model=List[MovementResponse], summary="List stock movements audit log")
def list_movements(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    medicine_id: Optional[uuid.UUID] = Query(None, description="Filter by medicine ID"),
    batch_id: Optional[uuid.UUID] = Query(None, description="Filter by batch ID"),
    movement_type: Optional[MovementType] = Query(None, description="Filter by movement type"),
    db: Session = Depends(get_db),
):
    service = MovementService(db)
    return service.list_movements(
        skip=skip,
        limit=limit,
        medicine_id=medicine_id,
        batch_id=batch_id,
        movement_type=movement_type,
    )


@router.post(
    "/purchase",
    response_model=MovementResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Process purchase receipt",
)
def process_purchase(req: PurchaseRequest, db: Session = Depends(get_db)):
    service = MovementService(db)
    return service.process_purchase(req)


@router.post(
    "/sale",
    response_model=MovementResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Process sale / stock dispatch",
)
def process_sale(req: SaleRequest, db: Session = Depends(get_db)):
    service = MovementService(db)
    return service.process_sale(req)


@router.post(
    "/return",
    response_model=MovementResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Process stock return",
)
def process_return(req: ReturnRequest, db: Session = Depends(get_db)):
    service = MovementService(db)
    return service.process_return(req)


@router.post(
    "/adjustment",
    response_model=MovementResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Process inventory adjustment",
)
def process_adjustment(req: AdjustmentRequest, db: Session = Depends(get_db)):
    service = MovementService(db)
    return service.process_adjustment(req)
