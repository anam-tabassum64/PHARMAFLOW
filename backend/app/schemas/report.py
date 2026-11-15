import uuid
from datetime import date
from decimal import Decimal
from typing import List

from pydantic import BaseModel

from app.schemas.batch import BatchResponse
from app.schemas.movement import MovementResponse


class InventorySummaryResponse(BaseModel):
    total_medicines: int
    active_medicines: int
    total_batches: int
    total_units_in_stock: int
    total_inventory_valuation: Decimal
    low_stock_medicines_count: int
    expired_batches_count: int
    expiring_soon_count: int  # within 30 days


class LowStockMedicineResponse(BaseModel):
    id: uuid.UUID
    medicine_code: str
    name: str
    category: str
    reorder_level: int
    total_available_stock: int
    deficit: int
    unit: str


class BatchStockItem(BaseModel):
    batch_id: uuid.UUID
    batch_number: str
    expiry_date: date
    purchase_price: Decimal
    selling_price: Decimal
    available_quantity: int
    valuation: Decimal
    is_expired: bool
    status: str


class MedicineStockReportItem(BaseModel):
    medicine_id: uuid.UUID
    medicine_code: str
    name: str
    generic_name: str
    category: str
    unit: str
    reorder_level: int
    total_available_stock: int
    total_valuation: Decimal
    batches: List[BatchStockItem]


class ExpiryReportResponse(BaseModel):
    total_batches_checked: int
    expired_batches: List[BatchResponse]
    expiring_in_30_days: List[BatchResponse]
    expiring_in_60_days: List[BatchResponse]
    expiring_in_90_days: List[BatchResponse]
    safe_batches: List[BatchResponse]


class MovementReportResponse(BaseModel):
    total_movements: int
    purchases_count: int
    sales_count: int
    returns_count: int
    adjustments_count: int
    total_units_purchased: int
    total_units_sold: int
    total_units_returned: int
    net_units_adjusted: int
    recent_movements: List[MovementResponse]
