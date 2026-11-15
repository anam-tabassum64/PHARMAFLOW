import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class MedicineBase(BaseModel):
    medicine_code: str = Field(
        ..., min_length=2, max_length=50, description="Unique medicine SKU/Code"
    )
    name: str = Field(..., min_length=2, max_length=200, description="Commercial medicine name")
    generic_name: str = Field(
        ...,
        min_length=2,
        max_length=200,
        description="Active chemical / generic compound",
    )
    category: str = Field(..., min_length=2, max_length=100, description="Therapeutic category")
    manufacturer: str = Field(
        ..., min_length=2, max_length=200, description="Pharmaceutical company"
    )
    unit: str = Field(
        default="Tablets",
        max_length=50,
        description="Dispensing unit (e.g. Tablets, Strips, Bottles)",
    )
    reorder_level: int = Field(
        default=10, ge=0, description="Stock threshold to trigger reorder alert"
    )
    description: Optional[str] = Field(default=None, description="Clinical or storage details")
    is_active: bool = Field(default=True, description="Whether the medicine is active for trading")


class MedicineCreate(MedicineBase):
    pass


class MedicineUpdate(BaseModel):
    medicine_code: Optional[str] = Field(default=None, min_length=2, max_length=50)
    name: Optional[str] = Field(default=None, min_length=2, max_length=200)
    generic_name: Optional[str] = Field(default=None, min_length=2, max_length=200)
    category: Optional[str] = Field(default=None, min_length=2, max_length=100)
    manufacturer: Optional[str] = Field(default=None, min_length=2, max_length=200)
    unit: Optional[str] = Field(default=None, max_length=50)
    reorder_level: Optional[int] = Field(default=None, ge=0)
    description: Optional[str] = None
    is_active: Optional[bool] = None


class MedicineResponse(MedicineBase):
    id: uuid.UUID
    total_available_stock: int = 0
    batch_count: int = 0
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
