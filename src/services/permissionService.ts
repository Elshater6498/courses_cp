import type { 
  Permission, 
  CreatePermissionInput, 
  UpdatePermissionInput, 
  PaginationParams, 
  PaginatedResponse, 
  ApiResponse 
} from '../types/api';
import { apiGet, apiPost, apiPut, apiDelete, apiGetPaginated } from './api';

const PERMISSION_BASE_PATH = '/dashboard/permissions';

// Get all permissions with pagination
export const getPermissions = async (params: PaginationParams = {}): Promise<PaginatedResponse<Permission>> => {
  return apiGetPaginated<Permission>(PERMISSION_BASE_PATH, params);
};

// Get all permissions without pagination
export const getAllPermissions = async (): Promise<ApiResponse<Permission[]>> => {
  return apiGet<Permission[]>(`${PERMISSION_BASE_PATH}/all`);
};

// Get permission by ID
export const getPermissionById = async (id: string): Promise<ApiResponse<Permission>> => {
  return apiGet<Permission>(`${PERMISSION_BASE_PATH}/${id}`);
};

// Create new permission
export const createPermission = async (data: CreatePermissionInput): Promise<ApiResponse<Permission>> => {
  return apiPost<Permission>(PERMISSION_BASE_PATH, data);
};

// Update permission
export const updatePermission = async (id: string, data: UpdatePermissionInput): Promise<ApiResponse<Permission>> => {
  return apiPut<Permission>(`${PERMISSION_BASE_PATH}/${id}`, data);
};

// Delete permission
export const deletePermission = async (id: string): Promise<ApiResponse<Permission>> => {
  return apiDelete<Permission>(`${PERMISSION_BASE_PATH}/${id}`);
};

// Get permission statistics
export const getPermissionStats = async (): Promise<ApiResponse<any>> => {
  return apiGet<any>(`${PERMISSION_BASE_PATH}/stats`);
};

// Search permissions
export const searchPermissions = async (params: PaginationParams = {}): Promise<PaginatedResponse<Permission>> => {
  return apiGetPaginated<Permission>(`${PERMISSION_BASE_PATH}/search`, params);
}; 