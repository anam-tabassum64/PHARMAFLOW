import { apiClient } from './client';
import { MedicineBatch, BatchCreateInput, BatchUpdateInput } from '../types/batch';

export const batchApi = {
  getAll: async (params?: { medicine_id?: string; search?: string; skip?: number; limit?: number }) => {
    const response = await apiClient.get<MedicineBatch[]>('/api/v1/batches', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get<MedicineBatch>(`/api/v1/batches/${id}`);
    return response.data;
  },

  create: async (data: BatchCreateInput) => {
    const response = await apiClient.post<MedicineBatch>('/api/v1/batches', data);
    return response.data;
  },

  update: async (id: string, data: BatchUpdateInput) => {
    const response = await apiClient.put<MedicineBatch>(`/api/v1/batches/${id}`, data);
    return response.data;
  },
};
