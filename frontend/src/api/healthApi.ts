import { apiClient } from './client';
import { HealthStatus, ReadinessStatus } from '../types/health';

export const healthApi = {
  getHealth: async () => {
    const response = await apiClient.get<HealthStatus>('/health');
    return response.data;
  },

  getReadiness: async () => {
    const response = await apiClient.get<ReadinessStatus>('/ready');
    return response.data;
  },
};
