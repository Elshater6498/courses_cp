import type { 
  LoginCredentials, 
  AuthResponse, 
  ApiResponse 
} from '../types/api';
import { apiGet, apiPost } from './api';

const AUTH_BASE_PATH = '/dashboard/auth';

// Admin login
export const login = async (credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> => {
  const response = await apiPost<AuthResponse>(`${AUTH_BASE_PATH}/login`, credentials);
  console.log(response);
  
  // Store token in localStorage
  if (response.success && response.data?.token) {
    localStorage.setItem('admin_token', response.data.token);
  }
  
  return response;
};

// Admin logout
export const logout = async (): Promise<ApiResponse<void>> => {
  const response = await apiPost<void>(`${AUTH_BASE_PATH}/logout`);
  
  // Clear token from localStorage
  localStorage.removeItem('admin_token');
  
  return response;
};

// Refresh token
export const refreshToken = async (): Promise<ApiResponse<AuthResponse>> => {
  const response = await apiPost<AuthResponse>(`${AUTH_BASE_PATH}/refresh`);
  
  // Update token in localStorage
  if (response.success && response.data?.token) {
    localStorage.setItem('admin_token', response.data.token);
  }
  
  return response;
};

// Get current admin profile
export const getProfile = async (): Promise<ApiResponse<any>> => {
  return apiGet<any>(`${AUTH_BASE_PATH}/profile`);
};

// Verify token
export const verifyToken = async (): Promise<ApiResponse<any>> => {
  return apiGet<any>(`${AUTH_BASE_PATH}/verify`);
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('admin_token');
  return !!token;
};

// Get stored token
export const getToken = (): string | null => {
  return localStorage.getItem('admin_token');
};

// Clear authentication
export const clearAuth = (): void => {
  localStorage.removeItem('admin_token');
}; 