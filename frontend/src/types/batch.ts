export interface MedicineBatch {
  id: string;
  medicine_id: string;
  medicine_name?: string;
  medicine_code?: string;
  batch_number: string;
  manufacturing_date: string;
  expiry_date: string;
  purchase_price: number | string;
  selling_price: number | string;
  initial_quantity: number;
  available_quantity: number;
  is_expired: boolean;
  days_to_expiry: number;
  created_at: string;
  updated_at: string;
}

export interface BatchCreateInput {
  medicine_id: string;
  batch_number: string;
  manufacturing_date: string;
  expiry_date: string;
  purchase_price: number;
  selling_price: number;
  initial_quantity: number;
}

export interface BatchUpdateInput {
  purchase_price?: number;
  selling_price?: number;
}
