import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosError } from 'axios';
import type { ApiResponse, PaginatedResponse } from '../types/api';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:6060/api/v1/';

// Create axios instance
const createApiInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
      'Accept-Language': 'all',
    },
  });

  // Request interceptor for adding auth token
  instance.interceptors.request.use(
    (config: any) => {
      const token = localStorage.getItem('admin_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error: any) => Promise.reject(error)
  );

  // Response interceptor for handling errors
  instance.interceptors.response.use(
    (response: any) => response,
    (error: AxiosError) => {
      if (error.response?.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('admin_token');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

// Create singleton instance
const apiInstance = createApiInstance();

// Generic API functions
export const apiGet = async <T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
  const response = await apiInstance.get(url, config);
  return response.data;
};

export const apiPost = async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
  const response = await apiInstance.post(url, data, config);
  return response.data;
};

export const apiPut = async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
  const response = await apiInstance.put(url, data, config);
  return response.data;
};

export const apiPatch = async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
  const response = await apiInstance.patch(url, data, config);
  return response.data;
};

export const apiDelete = async <T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
  const response = await apiInstance.delete(url, config);
  return response.data;
};

export const apiGetPaginated = async <T>(
  url: string, 
  params?: Record<string, any>, 
  config?: AxiosRequestConfig
): Promise<PaginatedResponse<T>> => {
  const response = await apiInstance.get(url, { 
    ...config, 
    params 
  });
  return response.data;
};

// Export instance for direct use if needed
export const getApiInstance = (): AxiosInstance => apiInstance; 