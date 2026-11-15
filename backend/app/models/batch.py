import uuid
from datetime import datetime, timezone

from sqlalchemy import (
    Column,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship

from app.database.base import GUID, Base


class MedicineBatch(Base):
    __tablename__ = "medicine_batches"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    medicine_id = Column(
        GUID(),
        ForeignKey("medicines.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    batch_number = Column(String(50), nullable=False, index=True)
    manufacturing_date = Column(Date, nullable=False)
    expiry_date = Column(Date, nullable=False, index=True)
    purchase_price = Column(Numeric(10, 2), nullable=False, default=0.00)
    selling_price = Column(Numeric(10, 2), nullable=False, default=0.00)
    initial_quantity = Column(Integer, nullable=False)
    available_quantity = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    __table_args__ = (
        UniqueConstraint("medicine_id", "batch_number", name="uq_medicine_batch_number"),
    )

    # Relationships
    medicine = relationship("Medicine", back_populates="batches")
    movements = relationship("StockMovement", back_populates="batch", lazy="selectin")
