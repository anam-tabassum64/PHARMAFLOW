from datetime import date, timedelta
from decimal import Decimal
from typing import List

from sqlalchemy.orm import Session

from app.models.batch import MedicineBatch
from app.models.medicine import Medicine
from app.models.stock_movement import MovementType, StockMovement
from app.schemas.batch import BatchResponse
from app.schemas.movement import MovementResponse
from app.schemas.report import (
    BatchStockItem,
    ExpiryReportResponse,
    MedicineStockReportItem,
    MovementReportResponse,
)


class ReportService:
    def __init__(self, db: Session):
        self.db = db

    def get_stock_report(self) -> List[MedicineStockReportItem]:
        today = date.today()
        medicines = self.db.query(Medicine).order_by(Medicine.name.asc()).all()
        report = []

        for m in medicines:
            batch_items = []
            med_total_stock = 0
            med_total_val = Decimal("0.00")

            for b in m.batches:
                is_expired = b.expiry_date < today
                val = Decimal(str(b.available_quantity)) * Decimal(str(b.purchase_price))
                med_total_stock += b.available_quantity
                med_total_val += val

                status = (
                    "EXPIRED"
                    if is_expired
                    else ("LOW" if b.available_quantity < 10 else "AVAILABLE")
                )
                batch_items.append(
                    BatchStockItem(
                        batch_id=b.id,
                        batch_number=b.batch_number,
                        expiry_date=b.expiry_date,
                        purchase_price=b.purchase_price,
                        selling_price=b.selling_price,
                        available_quantity=b.available_quantity,
                        valuation=round(val, 2),
                        is_expired=is_expired,
                        status=status,
                    )
                )

            report.append(
                MedicineStockReportItem(
                    medicine_id=m.id,
                    medicine_code=m.medicine_code,
                    name=m.name,
                    generic_name=m.generic_name,
                    category=m.category,
                    unit=m.unit,
                    reorder_level=m.reorder_level,
                    total_available_stock=med_total_stock,
                    total_valuation=round(med_total_val, 2),
                    batches=batch_items,
                )
            )

        return report

    def get_expiry_report(self) -> ExpiryReportResponse:
        today = date.today()
        d30 = today + timedelta(days=30)
        d60 = today + timedelta(days=60)
        d90 = today + timedelta(days=90)

        batches = self.db.query(MedicineBatch).order_by(MedicineBatch.expiry_date.asc()).all()

        expired = []
        in_30 = []
        in_60 = []
        in_90 = []
        safe = []

        for b in batches:
            medicine = b.medicine
            b_resp = BatchResponse(
                id=b.id,
                medicine_id=b.medicine_id,
                medicine_name=medicine.name if medicine else None,
                medicine_code=medicine.medicine_code if medicine else None,
                batch_number=b.batch_number,
                manufacturing_date=b.manufacturing_date,
                expiry_date=b.expiry_date,
                purchase_price=b.purchase_price,
                selling_price=b.selling_price,
                initial_quantity=b.initial_quantity,
                available_quantity=b.available_quantity,
                is_expired=b.expiry_date < today,
                days_to_expiry=(b.expiry_date - today).days,
                created_at=b.created_at,
                updated_at=b.updated_at,
            )

            if b.expiry_date < today:
                expired.append(b_resp)
            elif today <= b.expiry_date <= d30:
                in_30.append(b_resp)
            elif d30 < b.expiry_date <= d60:
                in_60.append(b_resp)
            elif d60 < b.expiry_date <= d90:
                in_90.append(b_resp)
            else:
                safe.append(b_resp)

        return ExpiryReportResponse(
            total_batches_checked=len(batches),
            expired_batches=expired,
            expiring_in_30_days=in_30,
            expiring_in_60_days=in_60,
            expiring_in_90_days=in_90,
            safe_batches=safe,
        )

    def get_movement_report(self) -> MovementReportResponse:
        movements = self.db.query(StockMovement).order_by(StockMovement.created_at.desc()).all()

        purchases = [m for m in movements if m.movement_type == MovementType.PURCHASE]
        sales = [m for m in movements if m.movement_type == MovementType.SALE]
        returns = [m for m in movements if m.movement_type == MovementType.RETURN]
        adjustments = [m for m in movements if m.movement_type == MovementType.ADJUSTMENT]

        total_purchased = sum(m.quantity for m in purchases)
        total_sold = sum(abs(m.quantity) for m in sales)
        total_returned = sum(m.quantity for m in returns)
        net_adjusted = sum(m.quantity for m in adjustments)

        recent = []
        for m in movements[:50]:
            recent.append(
                MovementResponse(
                    id=m.id,
                    medicine_id=m.medicine_id,
                    medicine_name=m.medicine.name if m.medicine else None,
                    medicine_code=m.medicine.medicine_code if m.medicine else None,
                    batch_id=m.batch_id,
                    batch_number=m.batch.batch_number if m.batch else None,
                    movement_type=m.movement_type,
                    quantity=m.quantity,
                    reference_number=m.reference_number,
                    notes=m.notes,
                    created_at=m.created_at,
                )
            )

        return MovementReportResponse(
            total_movements=len(movements),
            purchases_count=len(purchases),
            sales_count=len(sales),
            returns_count=len(returns),
            adjustments_count=len(adjustments),
            total_units_purchased=total_purchased,
            total_units_sold=total_sold,
            total_units_returned=total_returned,
            net_units_adjusted=net_adjusted,
            recent_movements=recent,
        )
