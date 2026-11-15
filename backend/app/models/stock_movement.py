import enum
import uuid
from datetime import datetime, timezone

from sqlalchemy import (
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy import (
    Enum as SQLEnum,
)
from sqlalchemy.orm import relationship

from app.database.base import GUID, Base


class MovementType(str, enum.Enum):
    PURCHASE = "PURCHASE"
    SALE = "SALE"
    RETURN = "RETURN"
    ADJUSTMENT = "ADJUSTMENT"


class StockMovement(Base):
    __tablename__ = "stock_movements"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    medicine_id = Column(
        GUID(),
        ForeignKey("medicines.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    batch_id = Column(
        GUID(),
        ForeignKey("medicine_batches.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    movement_type = Column(
        SQLEnum(MovementType, name="movement_type_enum", native_enum=False),
        nullable=False,
        index=True,
    )
    quantity = Column(
        Integer, nullable=False
    )  # positive for stock addition, negative for stock reduction
    reference_number = Column(String(100), nullable=False, index=True)
    notes = Column(Text, nullable=True)
    created_at = Column(
        DateTime, default=lambda: datetime.now(timezone.utc), nullable=False, index=True
    )

    # Relationships
    medicine = relationship("Medicine", back_populates="movements")
    batch = relationship("MedicineBatch", back_populates="movements")
