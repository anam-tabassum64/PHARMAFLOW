import uuid
from typing import List, Optional

from sqlalchemy import func, update
from sqlalchemy.orm import Session

from app.models.batch import MedicineBatch
from app.models.stock_movement import StockMovement
from app.schemas.batch import BatchCreate, BatchUpdate


class BatchRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(
        self, batch_id: uuid.UUID, lock_for_update: bool = False
    ) -> Optional[MedicineBatch]:
        query = self.db.query(MedicineBatch).filter(MedicineBatch.id == batch_id)
        if lock_for_update:
            # PostgreSQL supports row locking; SQLite ignores or serializes transactions
            try:
                query = query.with_for_update()
            except Exception:
                pass
        return query.first()

    def get_by_medicine_and_batch_number(
        self, medicine_id: uuid.UUID, batch_number: str
    ) -> Optional[MedicineBatch]:
        return (
            self.db.query(MedicineBatch)
            .filter(
                MedicineBatch.medicine_id == medicine_id,
                MedicineBatch.batch_number == batch_number,
            )
            .first()
        )

    def list(
        self,
        skip: int = 0,
        limit: int = 100,
        medicine_id: Optional[uuid.UUID] = None,
        search: Optional[str] = None,
    ) -> List[MedicineBatch]:
        query = self.db.query(MedicineBatch)
        if medicine_id:
            query = query.filter(MedicineBatch.medicine_id == medicine_id)
        if search:
            query = query.filter(MedicineBatch.batch_number.ilike(f"%{search}%"))
        return query.order_by(MedicineBatch.expiry_date.asc()).offset(skip).limit(limit).all()

    def create(self, batch_in: BatchCreate) -> MedicineBatch:
        db_batch = MedicineBatch(
            medicine_id=batch_in.medicine_id,
            batch_number=batch_in.batch_number,
            manufacturing_date=batch_in.manufacturing_date,
            expiry_date=batch_in.expiry_date,
            purchase_price=batch_in.purchase_price,
            selling_price=batch_in.selling_price,
            initial_quantity=batch_in.initial_quantity,
            available_quantity=batch_in.initial_quantity,
        )
        self.db.add(db_batch)
        self.db.commit()
        self.db.refresh(db_batch)
        return db_batch

    def update(self, db_batch: MedicineBatch, batch_in: BatchUpdate) -> MedicineBatch:
        update_data = batch_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_batch, field, value)
        self.db.commit()
        self.db.refresh(db_batch)
        return db_batch

    def atomic_deduct_stock(self, batch_id: uuid.UUID, quantity: int) -> bool:
        """
        Executes a safe atomic conditional update.
        Ensures stock cannot drop below zero under concurrent sales.
        Returns True if successful, False if insufficient stock or batch not found.
        """
        stmt = (
            update(MedicineBatch)
            .where(MedicineBatch.id == batch_id)
            .where(MedicineBatch.available_quantity >= quantity)
            .values(available_quantity=MedicineBatch.available_quantity - quantity)
        )
        result = self.db.execute(stmt)
        return result.rowcount > 0

    def atomic_add_stock(self, batch_id: uuid.UUID, quantity: int) -> bool:
        stmt = (
            update(MedicineBatch)
            .where(MedicineBatch.id == batch_id)
            .values(available_quantity=MedicineBatch.available_quantity + quantity)
        )
        result = self.db.execute(stmt)
        return result.rowcount > 0

    def has_historical_movements(self, batch_id: uuid.UUID) -> bool:
        count = (
            self.db.query(func.count(StockMovement.id))
            .filter(StockMovement.batch_id == batch_id)
            .scalar()
        )
        return (count or 0) > 0
