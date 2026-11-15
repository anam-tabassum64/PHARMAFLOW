import uuid
from typing import List, Optional

from sqlalchemy.orm import Session

from app.models.stock_movement import MovementType, StockMovement


class MovementRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, movement_id: uuid.UUID) -> Optional[StockMovement]:
        return self.db.query(StockMovement).filter(StockMovement.id == movement_id).first()

    def create(
        self,
        medicine_id: uuid.UUID,
        batch_id: uuid.UUID,
        movement_type: MovementType,
        quantity: int,
        reference_number: str,
        notes: Optional[str] = None,
    ) -> StockMovement:
        movement = StockMovement(
            medicine_id=medicine_id,
            batch_id=batch_id,
            movement_type=movement_type,
            quantity=quantity,
            reference_number=reference_number,
            notes=notes,
        )
        self.db.add(movement)
        return movement

    def list(
        self,
        skip: int = 0,
        limit: int = 100,
        medicine_id: Optional[uuid.UUID] = None,
        batch_id: Optional[uuid.UUID] = None,
        movement_type: Optional[MovementType] = None,
    ) -> List[StockMovement]:
        query = self.db.query(StockMovement)
        if medicine_id:
            query = query.filter(StockMovement.medicine_id == medicine_id)
        if batch_id:
            query = query.filter(StockMovement.batch_id == batch_id)
        if movement_type:
            query = query.filter(StockMovement.movement_type == movement_type)
        return query.order_by(StockMovement.created_at.desc()).offset(skip).limit(limit).all()
