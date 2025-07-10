import { apiGet, apiPut, apiDelete, apiPatch, apiGetPaginated } from './api';
import type { PaginationParams, User, UpdateUserInput, Device, ApiResponse, PaginatedResponse } from '../types/api';

// User API functions
export const getUsers = async (params: PaginationParams = {}): Promise<PaginatedResponse<User>> => {
  return apiGetPaginated<User>('/dashboard/users', params);
};

export const getUserById = async (id: string): Promise<ApiResponse<User>> => {
  return apiGet<User>(`/dashboard/users/${id}`);
};

export const updateUser = async (id: string, data: UpdateUserInput): Promise<ApiResponse<User>> => {
  return apiPut<User>(`/dashboard/users/${id}`, data);
};

export const deleteUser = async (id: string): Promise<ApiResponse<void>> => {
  return apiDelete<void>(`/dashboard/users/${id}`);
};

export const toggleUserBlock = async (id: string, blocked: boolean): Promise<ApiResponse<User>> => {
  return apiPatch<User>(`/dashboard/users/${id}/block`, { blocked });
};

export const getUserStats = async (): Promise<ApiResponse<{
  total: number;
  blocked: number;
  verified: number;
  unverified: number;
}>> => {
  return apiGet<{
    total: number;
    blocked: number;
    verified: number;
    unverified: number;
  }>('/dashboard/users/stats');
};

export const getUserDevices = async (id: string): Promise<ApiResponse<Device[]>> => {
  return apiGet<Device[]>(`/dashboard/users/${id}/devices`);
};

export const removeUserDevice = async (id: string, deviceId: string): Promise<ApiResponse<void>> => {
  return apiDelete<void>(`/dashboard/users/${id}/devices/${deviceId}`);
};

// Search users
export const searchUsers = async (params: PaginationParams = {}): Promise<PaginatedResponse<User>> => {
  return getUsers(params);
}; 