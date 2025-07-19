import type { 
  Permission, 
  CreatePermissionInput, 
  UpdatePermissionInput, 
  PaginationParams, 
  PaginatedResponse, 
  ApiResponse,
  GroupedPermissionsResponse,
  PermissionGroup
} from '../types/api';
import { apiGet, apiPost, apiPut, apiDelete, apiGetPaginated } from './api';

const PERMISSION_BASE_PATH = '/dashboard/permissions';

// Get all permissions with pagination
export const getPermissions = async (params: PaginationParams = {}): Promise<PaginatedResponse<Permission>> => {
  return apiGetPaginated<Permission>(PERMISSION_BASE_PATH, params);
};

// Get all permissions without pagination (now returns grouped permissions)
export const getAllPermissions = async (): Promise<GroupedPermissionsResponse> => {
  const response = await apiGet<PermissionGroup[]>(`${PERMISSION_BASE_PATH}`);
  return {
    success: response.success,
    message: response.message,
    data: response.data || [],
    count: response.data?.length || 0
  };
};

// Get all permissions as flat array (for backward compatibility)
export const getAllPermissionsFlat = async (): Promise<ApiResponse<Permission[]>> => {
  const groupedResponse = await getAllPermissions();
  const flatPermissions = groupedResponse.data.flatMap(group => group.permissions);
  return {
    success: groupedResponse.success,
    message: groupedResponse.message,
    data: flatPermissions
  };
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