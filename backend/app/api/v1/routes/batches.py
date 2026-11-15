import uuid
from typing import List, Optional

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.schemas.batch import BatchCreate, BatchResponse, BatchUpdate
from app.services.batch_service import BatchService

router = APIRouter(prefix="/batches", tags=["Batches"])


@router.get("", response_model=List[BatchResponse], summary="List batches with filtering")
def list_batches(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    medicine_id: Optional[uuid.UUID] = Query(None, description="Filter by medicine ID"),
    search: Optional[str] = Query(None, description="Search by batch number"),
    db: Session = Depends(get_db),
):
    service = BatchService(db)
    return service.list_batches(skip=skip, limit=limit, medicine_id=medicine_id, search=search)


@router.get("/{id}", response_model=BatchResponse, summary="Get batch by ID")
def get_batch(id: uuid.UUID, db: Session = Depends(get_db)):
    service = BatchService(db)
    return service.get_batch(id)


@router.post(
    "",
    response_model=BatchResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new batch",
)
def create_batch(batch_in: BatchCreate, db: Session = Depends(get_db)):
    service = BatchService(db)
    return service.create_batch(batch_in)


@router.put("/{id}", response_model=BatchResponse, summary="Update batch pricing metadata")
def update_batch(id: uuid.UUID, batch_in: BatchUpdate, db: Session = Depends(get_db)):
    service = BatchService(db)
    return service.update_batch(id, batch_in)
