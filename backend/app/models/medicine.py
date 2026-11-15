import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, Column, DateTime, Integer, String, Text
from sqlalchemy.orm import relationship

from app.database.base import GUID, Base


class Medicine(Base):
    __tablename__ = "medicines"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    medicine_code = Column(String(50), unique=True, nullable=False, index=True)
    name = Column(String(200), nullable=False, index=True)
    generic_name = Column(String(200), nullable=False)
    category = Column(String(100), nullable=False, index=True)
    manufacturer = Column(String(200), nullable=False)
    unit = Column(String(50), nullable=False, default="Tablets")
    reorder_level = Column(Integer, nullable=False, default=10)
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    batches = relationship(
        "MedicineBatch",
        back_populates="medicine",
        cascade="all, delete-orphan",
        lazy="selectin",
    )
    movements = relationship("StockMovement", back_populates="medicine", lazy="selectin")
