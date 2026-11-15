import uuid
from typing import List, Optional

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.schemas.medicine import MedicineCreate, MedicineResponse, MedicineUpdate
from app.services.medicine_service import MedicineService

router = APIRouter(prefix="/medicines", tags=["Medicines"])


@router.get("", response_model=List[MedicineResponse], summary="List medicines with filtering")
def list_medicines(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    search: Optional[str] = Query(
        None, description="Search by name, generic name, code, manufacturer"
    ),
    category: Optional[str] = Query(None, description="Filter by category"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    db: Session = Depends(get_db),
):
    service = MedicineService(db)
    return service.list_medicines(
        skip=skip, limit=limit, search=search, category=category, is_active=is_active
    )


@router.get("/{id}", response_model=MedicineResponse, summary="Get medicine by ID")
def get_medicine(id: uuid.UUID, db: Session = Depends(get_db)):
    service = MedicineService(db)
    return service.get_medicine(id)


@router.post(
    "",
    response_model=MedicineResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new medicine",
)
def create_medicine(medicine_in: MedicineCreate, db: Session = Depends(get_db)):
    service = MedicineService(db)
    return service.create_medicine(medicine_in)


@router.put("/{id}", response_model=MedicineResponse, summary="Update medicine details")
def update_medicine(id: uuid.UUID, medicine_in: MedicineUpdate, db: Session = Depends(get_db)):
    service = MedicineService(db)
    return service.update_medicine(id, medicine_in)


@router.delete(
    "/{id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete medicine (guarded against history)",
)
def delete_medicine(id: uuid.UUID, db: Session = Depends(get_db)):
    service = MedicineService(db)
    service.delete_medicine(id)
    return None
