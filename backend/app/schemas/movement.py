import uuid
from datetime import date, datetime
from decimal import Decimal
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, Field

from app.models.stock_movement import MovementType


class PurchaseRequest(BaseModel):
    medicine_id: uuid.UUID
    # Can purchase into existing batch or create a new batch
    batch_id: Optional[uuid.UUID] = None
    batch_number: Optional[str] = Field(default=None, max_length=50)
    manufacturing_date: Optional[date] = None
    expiry_date: Optional[date] = None
    purchase_price: Optional[Decimal] = Field(default=None, ge=0)
    selling_price: Optional[Decimal] = Field(default=None, ge=0)
    quantity: int = Field(..., gt=0, description="Quantity must be strictly greater than 0")
    reference_number: Optional[str] = Field(default=None, max_length=100)
    notes: Optional[str] = Field(default=None, max_length=500)


class SaleRequest(BaseModel):
    batch_id: uuid.UUID
    quantity: int = Field(
        ..., gt=0, description="Quantity to sell, must be strictly greater than 0"
    )
    reference_number: Optional[str] = Field(default=None, max_length=100)
    notes: Optional[str] = Field(default=None, max_length=500)


class ReturnRequest(BaseModel):
    batch_id: uuid.UUID
    quantity: int = Field(
        ..., gt=0, description="Quantity to return, must be strictly greater than 0"
    )
    reference_number: Optional[str] = Field(default=None, max_length=100)
    notes: Optional[str] = Field(default=None, max_length=500, description="Reason for return")


class AdjustmentRequest(BaseModel):
    batch_id: uuid.UUID
    direction: Literal["INCREASE", "DECREASE"] = Field(
        ..., description="Explicit adjustment direction"
    )
    quantity: int = Field(
        ..., gt=0, description="Adjustment quantity, must be strictly greater than 0"
    )
    reference_number: Optional[str] = Field(default=None, max_length=100)
    notes: str = Field(
        ...,
        min_length=3,
        max_length=500,
        description="Mandatory audit reason for adjustment",
    )


class MovementResponse(BaseModel):
    id: uuid.UUID
    medicine_id: uuid.UUID
    medicine_name: Optional[str] = None
    medicine_code: Optional[str] = None
    batch_id: uuid.UUID
    batch_number: Optional[str] = None
    movement_type: MovementType
    quantity: int
    reference_number: str
    notes: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
