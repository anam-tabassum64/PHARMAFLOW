import uuid
from datetime import date, datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, model_validator


class BatchBase(BaseModel):
    batch_number: str = Field(
        ..., min_length=2, max_length=50, description="Batch reference lot number"
    )
    manufacturing_date: date = Field(..., description="Manufacturing date (YYYY-MM-DD)")
    expiry_date: date = Field(..., description="Expiry date (YYYY-MM-DD)")
    purchase_price: Decimal = Field(
        ..., ge=0, decimal_places=2, description="Purchase cost per unit"
    )
    selling_price: Decimal = Field(
        ..., ge=0, decimal_places=2, description="Selling price per unit"
    )
    initial_quantity: int = Field(
        ..., gt=0, description="Total units manufactured/received initially"
    )

    @model_validator(mode="after")
    def validate_dates(self) -> "BatchBase":
        if self.expiry_date <= self.manufacturing_date:
            raise ValueError("Expiry date must be strictly after the manufacturing date.")
        return self


class BatchCreate(BatchBase):
    medicine_id: uuid.UUID


class BatchUpdate(BaseModel):
    purchase_price: Optional[Decimal] = Field(default=None, ge=0, decimal_places=2)
    selling_price: Optional[Decimal] = Field(default=None, ge=0, decimal_places=2)


class BatchResponse(BaseModel):
    id: uuid.UUID
    medicine_id: uuid.UUID
    medicine_name: Optional[str] = None
    medicine_code: Optional[str] = None
    batch_number: str
    manufacturing_date: date
    expiry_date: date
    purchase_price: Decimal
    selling_price: Decimal
    initial_quantity: int
    available_quantity: int
    is_expired: bool = False
    days_to_expiry: int = 0
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
