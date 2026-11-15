export type MovementType = 'PURCHASE' | 'SALE' | 'RETURN' | 'ADJUSTMENT';

export interface StockMovement {
  id: string;
  medicine_id: string;
  medicine_name?: string;
  medicine_code?: string;
  batch_id: string;
  batch_number?: string;
  movement_type: MovementType;
  quantity: number;
  reference_number: string;
  notes?: string | null;
  created_at: string;
}

export interface PurchaseInput {
  medicine_id: string;
  batch_id?: string;
  batch_number?: string;
  manufacturing_date?: string;
  expiry_date?: string;
  purchase_price?: number;
  selling_price?: number;
  quantity: number;
  reference_number?: string;
  notes?: string;
}

export interface SaleInput {
  batch_id: string;
  quantity: number;
  reference_number?: string;
  notes?: string;
}

export interface ReturnInput {
  batch_id: string;
  quantity: number;
  reference_number?: string;
  notes?: string;
}

export interface AdjustmentInput {
  batch_id: string;
  direction: 'INCREASE' | 'DECREASE';
  quantity: number;
  reference_number?: string;
  notes: string;
}
