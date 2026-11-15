import axios, { AxiosError } from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || '';

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

export interface ApiError {
  message: string;
  statusCode?: number;
  details?: Record<string, any>;
}

export function extractErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const axiosErr = error as AxiosError<any>;
    if (axiosErr.response?.data) {
      const data = axiosErr.response.data;
      if (typeof data.detail === 'string') {
        return data.detail;
      }
      if (Array.isArray(data.detail)) {
        // FastAPI / Pydantic validation errors
        return data.detail.map((err: any) => `${err.loc?.join(' -> ')}: ${err.msg}`).join('; ');
      }
      if (typeof data.message === 'string') {
        return data.message;
      }
    }
    if (axiosErr.message) {
      if (axiosErr.code === 'ERR_NETWORK') {
        return 'Network connection error: Unable to reach the PharmaFlow API. Please ensure the backend server is running.';
      }
      return axiosErr.message;
    }
  }
  return 'An unexpected error occurred. Please try again.';
}

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    const status = error.response?.status;
    const msg = extractErrorMessage(error);
    console.error(`[API Error] Status: ${status} | Message: ${msg}`);
    return Promise.reject(error);
  }
);
