import { apiClient } from './client';
import { Medicine } from '../types/medicine';
import { InventorySummary, LowStockMedicine } from '../types/report';

export const inventoryApi = {
  getInventory: async () => {
    const response = await apiClient.get<Medicine[]>('/api/v1/inventory');
    return response.data;
  },

  getSummary: async () => {
    const response = await apiClient.get<InventorySummary>('/api/v1/inventory/summary');
    return response.data;
  },

  getLowStock: async () => {
    const response = await apiClient.get<LowStockMedicine[]>('/api/v1/inventory/low-stock');
    return response.data;
  },
};
