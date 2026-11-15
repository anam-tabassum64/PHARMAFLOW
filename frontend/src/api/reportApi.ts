import { apiClient } from './client';
import {
  MedicineStockReportItem,
  ExpiryReport,
  MovementReport
} from '../types/report';

export const reportApi = {
  getStockReport: async () => {
    const response = await apiClient.get<MedicineStockReportItem[]>('/api/v1/reports/stock');
    return response.data;
  },

  getExpiryReport: async () => {
    const response = await apiClient.get<ExpiryReport>('/api/v1/reports/expiry');
    return response.data;
  },

  getMovementReport: async () => {
    const response = await apiClient.get<MovementReport>('/api/v1/reports/movements');
    return response.data;
  },
};
