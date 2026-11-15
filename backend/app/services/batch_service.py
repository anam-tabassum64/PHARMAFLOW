import uuid
from datetime import date
from typing import List, Optional

from sqlalchemy.orm import Session

from app.core.exceptions import (
    ConflictException,
    NotFoundException,
)
from app.repositories.batch_repository import BatchRepository
from app.repositories.medicine_repository import MedicineRepository
from app.schemas.batch import BatchCreate, BatchResponse, BatchUpdate


class BatchService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = BatchRepository(db)
        self.med_repo = MedicineRepository(db)

    def _format_batch_response(self, batch) -> BatchResponse:
        today = date.today()
        is_expired = batch.expiry_date < today
        days_to_expiry = (batch.expiry_date - today).days

        medicine = self.med_repo.get_by_id(batch.medicine_id)
        med_name = medicine.name if medicine else None
        med_code = medicine.medicine_code if medicine else None

        res = BatchResponse(
            id=batch.id,
            medicine_id=batch.medicine_id,
            medicine_name=med_name,
            medicine_code=med_code,
            batch_number=batch.batch_number,
            manufacturing_date=batch.manufacturing_date,
            expiry_date=batch.expiry_date,
            purchase_price=batch.purchase_price,
            selling_price=batch.selling_price,
            initial_quantity=batch.initial_quantity,
            available_quantity=batch.available_quantity,
            is_expired=is_expired,
            days_to_expiry=days_to_expiry,
            created_at=batch.created_at,
            updated_at=batch.updated_at,
        )
        return res

    def get_batch(self, batch_id: uuid.UUID) -> BatchResponse:
        batch = self.repo.get_by_id(batch_id)
        if not batch:
            raise NotFoundException("MedicineBatch", str(batch_id))
        return self._format_batch_response(batch)

    def list_batches(
        self,
        skip: int = 0,
        limit: int = 100,
        medicine_id: Optional[uuid.UUID] = None,
        search: Optional[str] = None,
    ) -> List[BatchResponse]:
        batches = self.repo.list(skip=skip, limit=limit, medicine_id=medicine_id, search=search)
        return [self._format_batch_response(b) for b in batches]

    def create_batch(self, batch_in: BatchCreate) -> BatchResponse:
        # Validate medicine exists
        medicine = self.med_repo.get_by_id(batch_in.medicine_id)
        if not medicine:
            raise NotFoundException("Medicine", str(batch_in.medicine_id))

        # Check unique constraint (medicine_id, batch_number)
        existing = self.repo.get_by_medicine_and_batch_number(
            batch_in.medicine_id, batch_in.batch_number
        )
        if existing:
            raise ConflictException(
                f"Batch number '{batch_in.batch_number}' already exists for this medicine."
            )

        created = self.repo.create(batch_in)
        return self._format_batch_response(created)

    def update_batch(self, batch_id: uuid.UUID, batch_in: BatchUpdate) -> BatchResponse:
        batch = self.repo.get_by_id(batch_id)
        if not batch:
            raise NotFoundException("MedicineBatch", str(batch_id))

        updated = self.repo.update(batch, batch_in)
        return self._format_batch_response(updated)
