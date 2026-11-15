import { apiClient } from './client';
import { Medicine, MedicineCreateInput, MedicineUpdateInput } from '../types/medicine';

export const medicineApi = {
  getAll: async (params?: { search?: string; category?: string; is_active?: boolean; skip?: number; limit?: number }) => {
    const response = await apiClient.get<Medicine[]>('/api/v1/medicines', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get<Medicine>(`/api/v1/medicines/${id}`);
    return response.data;
  },

  create: async (data: MedicineCreateInput) => {
    const response = await apiClient.post<Medicine>('/api/v1/medicines', data);
    return response.data;
  },

  update: async (id: string, data: MedicineUpdateInput) => {
    const response = await apiClient.put<Medicine>(`/api/v1/medicines/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    await apiClient.delete(`/api/v1/medicines/${id}`);
  },
};
