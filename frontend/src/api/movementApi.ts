import { apiClient } from './client';
import {
  StockMovement,
  PurchaseInput,
  SaleInput,
  ReturnInput,
  AdjustmentInput,
  MovementType
} from '../types/movement';

export const movementApi = {
  getAll: async (params?: {
    medicine_id?: string;
    batch_id?: string;
    movement_type?: MovementType;
    skip?: number;
    limit?: number;
  }) => {
    const response = await apiClient.get<StockMovement[]>('/api/v1/movements', { params });
    return response.data;
  },

  purchase: async (data: PurchaseInput) => {
    const response = await apiClient.post<StockMovement>('/api/v1/movements/purchase', data);
    return response.data;
  },

  sale: async (data: SaleInput) => {
    const response = await apiClient.post<StockMovement>('/api/v1/movements/sale', data);
    return response.data;
  },

  returnStock: async (data: ReturnInput) => {
    const response = await apiClient.post<StockMovement>('/api/v1/movements/return', data);
    return response.data;
  },

  adjustment: async (data: AdjustmentInput) => {
    const response = await apiClient.post<StockMovement>('/api/v1/movements/adjustment', data);
    return response.data;
  },
};
