import uuid
from typing import List, Optional

from sqlalchemy.orm import Session

from app.core.exceptions import (
    ConflictException,
    NotFoundException,
)
from app.repositories.medicine_repository import MedicineRepository
from app.schemas.medicine import MedicineCreate, MedicineResponse, MedicineUpdate


class MedicineService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = MedicineRepository(db)

    def get_medicine(self, medicine_id: uuid.UUID) -> MedicineResponse:
        medicine = self.repo.get_by_id(medicine_id)
        if not medicine:
            raise NotFoundException("Medicine", str(medicine_id))
        stock, batch_count = self.repo.get_stock_and_batch_count(medicine.id)
        res = MedicineResponse.model_validate(medicine)
        res.total_available_stock = stock
        res.batch_count = batch_count
        return res

    def list_medicines(
        self,
        skip: int = 0,
        limit: int = 100,
        search: Optional[str] = None,
        category: Optional[str] = None,
        is_active: Optional[bool] = None,
    ) -> List[MedicineResponse]:
        medicines = self.repo.list(
            skip=skip,
            limit=limit,
            search=search,
            category=category,
            is_active=is_active,
        )
        result = []
        for m in medicines:
            stock, batch_count = self.repo.get_stock_and_batch_count(m.id)
            res = MedicineResponse.model_validate(m)
            res.total_available_stock = stock
            res.batch_count = batch_count
            result.append(res)
        return result

    def create_medicine(self, medicine_in: MedicineCreate) -> MedicineResponse:
        existing = self.repo.get_by_code(medicine_in.medicine_code)
        if existing:
            raise ConflictException(
                f"Medicine with code '{medicine_in.medicine_code}' already exists."
            )
        created = self.repo.create(medicine_in)
        res = MedicineResponse.model_validate(created)
        res.total_available_stock = 0
        res.batch_count = 0
        return res

    def update_medicine(
        self, medicine_id: uuid.UUID, medicine_in: MedicineUpdate
    ) -> MedicineResponse:
        medicine = self.repo.get_by_id(medicine_id)
        if not medicine:
            raise NotFoundException("Medicine", str(medicine_id))

        if medicine_in.medicine_code and medicine_in.medicine_code != medicine.medicine_code:
            existing = self.repo.get_by_code(medicine_in.medicine_code)
            if existing:
                raise ConflictException(
                    f"Medicine code '{medicine_in.medicine_code}' is already used by another product."
                )

        updated = self.repo.update(medicine, medicine_in)
        stock, batch_count = self.repo.get_stock_and_batch_count(updated.id)
        res = MedicineResponse.model_validate(updated)
        res.total_available_stock = stock
        res.batch_count = batch_count
        return res

    def delete_medicine(self, medicine_id: uuid.UUID) -> None:
        medicine = self.repo.get_by_id(medicine_id)
        if not medicine:
            raise NotFoundException("Medicine", str(medicine_id))

        # Guard: Check historical movements
        if self.repo.has_historical_movements(medicine_id):
            raise ConflictException(
                "Cannot delete medicine: Historical stock movements exist for this medicine. "
                "Archiving or deactivating is recommended to maintain legal audit trail compliance."
            )
        self.repo.delete(medicine)
