from datetime import date
from decimal import Decimal
from typing import List

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.batch import MedicineBatch
from app.models.medicine import Medicine
from app.schemas.report import InventorySummaryResponse, LowStockMedicineResponse


class InventoryService:
    def __init__(self, db: Session):
        self.db = db

    def get_summary(self) -> InventorySummaryResponse:
        today = date.today()

        total_medicines = self.db.query(func.count(Medicine.id)).scalar() or 0
        active_medicines = (
            self.db.query(func.count(Medicine.id)).filter(Medicine.is_active == True).scalar() or 0
        )
        total_batches = self.db.query(func.count(MedicineBatch.id)).scalar() or 0

        stock_sum = self.db.query(func.sum(MedicineBatch.available_quantity)).scalar() or 0

        # Valuation = sum of available_quantity * purchase_price
        batches = self.db.query(MedicineBatch).all()
        total_valuation = sum(
            Decimal(str(b.available_quantity)) * Decimal(str(b.purchase_price)) for b in batches
        )

        # Expired batches
        expired_count = sum(
            1 for b in batches if b.expiry_date < today and b.available_quantity > 0
        )

        # Expiring within 30 days
        expiring_soon_count = sum(
            1
            for b in batches
            if today <= b.expiry_date <= (today + date.resolution * 30) and b.available_quantity > 0
        )

        # Low stock count
        low_stock_count = 0
        medicines = self.db.query(Medicine).filter(Medicine.is_active == True).all()
        for m in medicines:
            m_stock = sum(b.available_quantity for b in m.batches)
            if m_stock <= m.reorder_level:
                low_stock_count += 1

        return InventorySummaryResponse(
            total_medicines=total_medicines,
            active_medicines=active_medicines,
            total_batches=total_batches,
            total_units_in_stock=stock_sum,
            total_inventory_valuation=Decimal(str(round(total_valuation, 2))),
            low_stock_medicines_count=low_stock_count,
            expired_batches_count=expired_count,
            expiring_soon_count=expiring_soon_count,
        )

    def get_low_stock(self) -> List[LowStockMedicineResponse]:
        medicines = self.db.query(Medicine).filter(Medicine.is_active == True).all()
        low_stock = []
        for m in medicines:
            total_stock = sum(b.available_quantity for b in m.batches)
            if total_stock <= m.reorder_level:
                low_stock.append(
                    LowStockMedicineResponse(
                        id=m.id,
                        medicine_code=m.medicine_code,
                        name=m.name,
                        category=m.category,
                        reorder_level=m.reorder_level,
                        total_available_stock=total_stock,
                        deficit=max(0, m.reorder_level - total_stock),
                        unit=m.unit,
                    )
                )
        return sorted(low_stock, key=lambda x: x.deficit, reverse=True)
