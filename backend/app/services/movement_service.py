import uuid
from datetime import date
from decimal import Decimal
from typing import List, Optional

from sqlalchemy.orm import Session

from app.core.exceptions import (
    ExpiredBatchException,
    InsufficientStockException,
    NotFoundException,
    ValidationException,
)
from app.core.security import generate_reference_number
from app.models.stock_movement import MovementType, StockMovement
from app.repositories.batch_repository import BatchRepository
from app.repositories.medicine_repository import MedicineRepository
from app.repositories.movement_repository import MovementRepository
from app.schemas.batch import BatchCreate
from app.schemas.movement import (
    AdjustmentRequest,
    MovementResponse,
    PurchaseRequest,
    ReturnRequest,
    SaleRequest,
)


class MovementService:
    def __init__(self, db: Session):
        self.db = db
        self.medicine_repo = MedicineRepository(db)
        self.batch_repo = BatchRepository(db)
        self.movement_repo = MovementRepository(db)

    def _format_movement_response(self, movement: StockMovement) -> MovementResponse:
        medicine = self.medicine_repo.get_by_id(movement.medicine_id)
        batch = self.batch_repo.get_by_id(movement.batch_id)
        return MovementResponse(
            id=movement.id,
            medicine_id=movement.medicine_id,
            medicine_name=medicine.name if medicine else None,
            medicine_code=medicine.medicine_code if medicine else None,
            batch_id=movement.batch_id,
            batch_number=batch.batch_number if batch else None,
            movement_type=movement.movement_type,
            quantity=movement.quantity,
            reference_number=movement.reference_number,
            notes=movement.notes,
            created_at=movement.created_at,
        )

    def list_movements(
        self,
        skip: int = 0,
        limit: int = 100,
        medicine_id: Optional[uuid.UUID] = None,
        batch_id: Optional[uuid.UUID] = None,
        movement_type: Optional[MovementType] = None,
    ) -> List[MovementResponse]:
        movements = self.movement_repo.list(
            skip=skip,
            limit=limit,
            medicine_id=medicine_id,
            batch_id=batch_id,
            movement_type=movement_type,
        )
        return [self._format_movement_response(m) for m in movements]

    def process_purchase(self, req: PurchaseRequest) -> MovementResponse:
        if req.quantity <= 0:
            raise ValidationException("Purchase quantity must be greater than zero.")

        # Validate medicine
        medicine = self.medicine_repo.get_by_id(req.medicine_id)
        if not medicine:
            raise NotFoundException("Medicine", str(req.medicine_id))

        batch = None
        if req.batch_id:
            batch = self.batch_repo.get_by_id(req.batch_id)
            if not batch or batch.medicine_id != req.medicine_id:
                raise NotFoundException("MedicineBatch", str(req.batch_id))
        elif req.batch_number:
            batch = self.batch_repo.get_by_medicine_and_batch_number(
                req.medicine_id, req.batch_number
            )
            if not batch:
                # Create batch on the fly if details provided
                if not req.manufacturing_date or not req.expiry_date:
                    raise ValidationException(
                        "New batch requires manufacturing_date and expiry_date."
                    )
                if req.expiry_date <= req.manufacturing_date:
                    raise ValidationException(
                        "Expiry date must be strictly after manufacturing date."
                    )

                batch = self.batch_repo.create(
                    BatchCreate(
                        medicine_id=req.medicine_id,
                        batch_number=req.batch_number,
                        manufacturing_date=req.manufacturing_date,
                        expiry_date=req.expiry_date,
                        purchase_price=req.purchase_price or Decimal("0.00"),
                        selling_price=req.selling_price or Decimal("0.00"),
                        initial_quantity=req.quantity,
                    )
                )
                # For newly created batch, initial_quantity already sets available_quantity.
                # Just record the movement:
                ref = req.reference_number or generate_reference_number("PO")
                movement = self.movement_repo.create(
                    medicine_id=medicine.id,
                    batch_id=batch.id,
                    movement_type=MovementType.PURCHASE,
                    quantity=req.quantity,
                    reference_number=ref,
                    notes=req.notes or f"Purchase received for new batch {batch.batch_number}",
                )
                self.db.commit()
                self.db.refresh(movement)
                return self._format_movement_response(movement)
        else:
            raise ValidationException(
                "Either batch_id or batch_number must be specified for purchase."
            )

        # Existing batch: atomically increase stock and record movement
        ref = req.reference_number or generate_reference_number("PO")
        try:
            self.batch_repo.atomic_add_stock(batch.id, req.quantity)
            movement = self.movement_repo.create(
                medicine_id=medicine.id,
                batch_id=batch.id,
                movement_type=MovementType.PURCHASE,
                quantity=req.quantity,
                reference_number=ref,
                notes=req.notes or f"Restock received for batch {batch.batch_number}",
            )
            self.db.commit()
            self.db.refresh(movement)
            return self._format_movement_response(movement)
        except Exception:
            self.db.rollback()
            raise

    def process_sale(self, req: SaleRequest) -> MovementResponse:
        if req.quantity <= 0:
            raise ValidationException("Sale quantity must be greater than zero.")

        # 1. Fetch batch (locking row if possible)
        batch = self.batch_repo.get_by_id(req.batch_id, lock_for_update=True)
        if not batch:
            raise NotFoundException("MedicineBatch", str(req.batch_id))

        # 2. Reject expired batches
        today = date.today()
        if batch.expiry_date < today:
            raise ExpiredBatchException(
                batch_number=batch.batch_number,
                expiry_date=batch.expiry_date.isoformat(),
            )

        # 3. Reject insufficient stock
        if batch.available_quantity < req.quantity:
            raise InsufficientStockException(
                batch_number=batch.batch_number,
                requested=req.quantity,
                available=batch.available_quantity,
            )

        # 4. Safe atomic conditional update to guarantee no concurrent overselling
        success = self.batch_repo.atomic_deduct_stock(batch.id, req.quantity)
        if not success:
            raise InsufficientStockException(
                batch_number=batch.batch_number,
                requested=req.quantity,
                available=batch.available_quantity,
            )

        # 5. Record sale movement
        ref = req.reference_number or generate_reference_number("INV")
        try:
            movement = self.movement_repo.create(
                medicine_id=batch.medicine_id,
                batch_id=batch.id,
                movement_type=MovementType.SALE,
                quantity=-req.quantity,  # delta is negative for sale
                reference_number=ref,
                notes=req.notes or f"Dispatched sale for batch {batch.batch_number}",
            )
            self.db.commit()
            self.db.refresh(movement)
            return self._format_movement_response(movement)
        except Exception:
            self.db.rollback()
            raise

    def process_return(self, req: ReturnRequest) -> MovementResponse:
        if req.quantity <= 0:
            raise ValidationException("Return quantity must be greater than zero.")

        batch = self.batch_repo.get_by_id(req.batch_id)
        if not batch:
            raise NotFoundException("MedicineBatch", str(req.batch_id))

        # Documented Return Policy:
        # Expired batches CANNOT be returned into saleable inventory.
        today = date.today()
        if batch.expiry_date < today:
            raise ExpiredBatchException(
                batch_number=batch.batch_number,
                expiry_date=batch.expiry_date.isoformat(),
            )

        ref = req.reference_number or generate_reference_number("RET")
        try:
            self.batch_repo.atomic_add_stock(batch.id, req.quantity)
            movement = self.movement_repo.create(
                medicine_id=batch.medicine_id,
                batch_id=batch.id,
                movement_type=MovementType.RETURN,
                quantity=req.quantity,
                reference_number=ref,
                notes=req.notes or f"Customer return processed for batch {batch.batch_number}",
            )
            self.db.commit()
            self.db.refresh(movement)
            return self._format_movement_response(movement)
        except Exception:
            self.db.rollback()
            raise

    def process_adjustment(self, req: AdjustmentRequest) -> MovementResponse:
        if req.quantity <= 0:
            raise ValidationException("Adjustment quantity must be greater than zero.")

        if not req.notes or len(req.notes.strip()) < 3:
            raise ValidationException(
                "Mandatory justification/reason is required for stock adjustment."
            )

        batch = self.batch_repo.get_by_id(req.batch_id, lock_for_update=True)
        if not batch:
            raise NotFoundException("MedicineBatch", str(req.batch_id))

        if req.direction == "DECREASE":
            if batch.available_quantity < req.quantity:
                raise InsufficientStockException(
                    batch_number=batch.batch_number,
                    requested=req.quantity,
                    available=batch.available_quantity,
                )
            delta = -req.quantity
            success = self.batch_repo.atomic_deduct_stock(batch.id, req.quantity)
            if not success:
                raise InsufficientStockException(
                    batch_number=batch.batch_number,
                    requested=req.quantity,
                    available=batch.available_quantity,
                )
        elif req.direction == "INCREASE":
            delta = req.quantity
            self.batch_repo.atomic_add_stock(batch.id, req.quantity)
        else:
            raise ValidationException(
                f"Invalid adjustment direction: {req.direction}. Must be INCREASE or DECREASE."
            )

        ref = req.reference_number or generate_reference_number("ADJ")
        try:
            movement = self.movement_repo.create(
                medicine_id=batch.medicine_id,
                batch_id=batch.id,
                movement_type=MovementType.ADJUSTMENT,
                quantity=delta,
                reference_number=ref,
                notes=f"[{req.direction}] {req.notes}",
            )
            self.db.commit()
            self.db.refresh(movement)
            return self._format_movement_response(movement)
        except Exception:
            self.db.rollback()
            raise
