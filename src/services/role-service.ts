import type { 
  Role, 
  CreateRoleInput, 
  UpdateRoleInput, 
  PaginationParams, 
  PaginatedResponse, 
  ApiResponse 
} from '../types/api';
import { apiGet, apiPost, apiPut, apiDelete, apiGetPaginated } from './api';

const ROLE_BASE_PATH = '/dashboard/roles';

// Get all roles with pagination
export const getRoles = async (params: PaginationParams = {}): Promise<PaginatedResponse<Role>> => {
  return apiGetPaginated<Role>(ROLE_BASE_PATH, params);
};

// Get all roles without pagination
export const getAllRoles = async (): Promise<ApiResponse<Role[]>> => {
  return apiGet<Role[]>(`${ROLE_BASE_PATH}/all`);
};

// Get role by ID
export const getRoleById = async (id: string): Promise<ApiResponse<Role>> => {
  return apiGet<Role>(`${ROLE_BASE_PATH}/${id}`);
};

// Create new role
export const createRole = async (data: CreateRoleInput): Promise<ApiResponse<Role>> => {
  return apiPost<Role>(ROLE_BASE_PATH, data);
};

// Update role
export const updateRole = async (id: string, data: UpdateRoleInput): Promise<ApiResponse<Role>> => {
  return apiPut<Role>(`${ROLE_BASE_PATH}/${id}`, data);
};

// Delete role (soft delete)
export const deleteRole = async (id: string): Promise<ApiResponse<Role>> => {
  return apiDelete<Role>(`${ROLE_BASE_PATH}/${id}`);
};

// Hard delete role
export const hardDeleteRole = async (id: string): Promise<ApiResponse<void>> => {
  return apiDelete<void>(`${ROLE_BASE_PATH}/${id}/hard`);
};

// Add permission to role
export const addPermissionToRole = async (roleId: string, permissionId: string): Promise<ApiResponse<Role>> => {
  return apiPost<Role>(`${ROLE_BASE_PATH}/${roleId}/permissions`, { permissionId });
};

// Remove permission from role
export const removePermissionFromRole = async (roleId: string, permissionId: string): Promise<ApiResponse<Role>> => {
  return apiDelete<Role>(`${ROLE_BASE_PATH}/${roleId}/permissions/${permissionId}`);
};

// Get role statistics
export const getRoleStats = async (): Promise<ApiResponse<any>> => {
  return apiGet<any>(`${ROLE_BASE_PATH}/stats`);
};

// Search roles with advanced filters
export const searchRoles = async (params: PaginationParams = {}): Promise<PaginatedResponse<Role>> => {
  return apiGetPaginated<Role>(`${ROLE_BASE_PATH}/search`, params);
};

// Get roles by permission
export const getRolesByPermission = async (permissionId: string, params: PaginationParams = {}): Promise<PaginatedResponse<Role>> => {
  return apiGetPaginated<Role>(`${ROLE_BASE_PATH}/permission/${permissionId}`, params);
}; 