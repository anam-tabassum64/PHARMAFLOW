export interface Medicine {
  id: string;
  medicine_code: string;
  name: string;
  generic_name: string;
  category: string;
  manufacturer: string;
  unit: string;
  reorder_level: number;
  description?: string | null;
  is_active: boolean;
  total_available_stock: number;
  batch_count: number;
  created_at: string;
  updated_at: string;
}

export interface MedicineCreateInput {
  medicine_code: string;
  name: string;
  generic_name: string;
  category: string;
  manufacturer: string;
  unit?: string;
  reorder_level?: number;
  description?: string;
  is_active?: boolean;
}

export interface MedicineUpdateInput {
  medicine_code?: string;
  name?: string;
  generic_name?: string;
  category?: string;
  manufacturer?: string;
  unit?: string;
  reorder_level?: number;
  description?: string;
  is_active?: boolean;
}
