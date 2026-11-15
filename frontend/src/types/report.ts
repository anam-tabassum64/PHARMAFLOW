import { MedicineBatch } from './batch';
import { StockMovement } from './movement';

export interface InventorySummary {
  total_medicines: number;
  active_medicines: number;
  total_batches: number;
  total_units_in_stock: number;
  total_inventory_valuation: number;
  low_stock_medicines_count: number;
  expired_batches_count: number;
  expiring_soon_count: number;
}

export interface LowStockMedicine {
  id: string;
  medicine_code: string;
  name: string;
  category: string;
  reorder_level: number;
  total_available_stock: number;
  deficit: number;
  unit: string;
}

export interface BatchStockItem {
  batch_id: string;
  batch_number: string;
  expiry_date: string;
  purchase_price: number;
  selling_price: number;
  available_quantity: number;
  valuation: number;
  is_expired: boolean;
  status: string;
}

export interface MedicineStockReportItem {
  medicine_id: string;
  medicine_code: string;
  name: string;
  generic_name: string;
  category: string;
  unit: string;
  reorder_level: number;
  total_available_stock: number;
  total_valuation: number;
  batches: BatchStockItem[];
}

export interface ExpiryReport {
  total_batches_checked: number;
  expired_batches: MedicineBatch[];
  expiring_in_30_days: MedicineBatch[];
  expiring_in_60_days: MedicineBatch[];
  expiring_in_90_days: MedicineBatch[];
  safe_batches: MedicineBatch[];
}

export interface MovementReport {
  total_movements: number;
  purchases_count: number;
  sales_count: number;
  returns_count: number;
  adjustments_count: number;
  total_units_purchased: number;
  total_units_sold: number;
  total_units_returned: number;
  net_units_adjusted: number;
  recent_movements: StockMovement[];
}
