import uuid
from typing import List, Optional

from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.models.batch import MedicineBatch
from app.models.medicine import Medicine
from app.models.stock_movement import StockMovement
from app.schemas.medicine import MedicineCreate, MedicineUpdate


class MedicineRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, medicine_id: uuid.UUID) -> Optional[Medicine]:
        return self.db.query(Medicine).filter(Medicine.id == medicine_id).first()

    def get_by_code(self, code: str) -> Optional[Medicine]:
        return self.db.query(Medicine).filter(Medicine.medicine_code == code).first()

    def list(
        self,
        skip: int = 0,
        limit: int = 100,
        search: Optional[str] = None,
        category: Optional[str] = None,
        is_active: Optional[bool] = None,
    ) -> List[Medicine]:
        query = self.db.query(Medicine)
        if is_active is not None:
            query = query.filter(Medicine.is_active == is_active)
        if category:
            query = query.filter(Medicine.category == category)
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                or_(
                    Medicine.name.ilike(search_term),
                    Medicine.generic_name.ilike(search_term),
                    Medicine.medicine_code.ilike(search_term),
                    Medicine.manufacturer.ilike(search_term),
                )
            )
        return query.order_by(Medicine.name.asc()).offset(skip).limit(limit).all()

    def create(self, medicine_in: MedicineCreate) -> Medicine:
        db_medicine = Medicine(
            medicine_code=medicine_in.medicine_code,
            name=medicine_in.name,
            generic_name=medicine_in.generic_name,
            category=medicine_in.category,
            manufacturer=medicine_in.manufacturer,
            unit=medicine_in.unit,
            reorder_level=medicine_in.reorder_level,
            description=medicine_in.description,
            is_active=medicine_in.is_active,
        )
        self.db.add(db_medicine)
        self.db.commit()
        self.db.refresh(db_medicine)
        return db_medicine

    def update(self, db_medicine: Medicine, medicine_in: MedicineUpdate) -> Medicine:
        update_data = medicine_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_medicine, field, value)
        self.db.commit()
        self.db.refresh(db_medicine)
        return db_medicine

    def has_historical_movements(self, medicine_id: uuid.UUID) -> bool:
        count = (
            self.db.query(func.count(StockMovement.id))
            .filter(StockMovement.medicine_id == medicine_id)
            .scalar()
        )
        return (count or 0) > 0

    def delete(self, db_medicine: Medicine) -> None:
        self.db.delete(db_medicine)
        self.db.commit()

    def get_stock_and_batch_count(self, medicine_id: uuid.UUID) -> tuple[int, int]:
        row = (
            self.db.query(
                func.coalesce(func.sum(MedicineBatch.available_quantity), 0),
                func.count(MedicineBatch.id),
            )
            .filter(MedicineBatch.medicine_id == medicine_id)
            .first()
        )
        if row:
            return int(row[0]), int(row[1])
        return 0, 0
