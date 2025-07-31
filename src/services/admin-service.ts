import type {
  Admin,
  CreateAdminInput,
  UpdateAdminInput,
  PaginationParams,
  PaginatedResponse,
  ApiResponse,
} from "../types/api"
import {
  apiGet,
  apiPost,
  apiPut,
  apiPatch,
  apiDelete,
  apiGetPaginated,
} from "./api"

const ADMIN_BASE_PATH = "/dashboard/admin"

// Get all admins with pagination
export const getAdmins = async (
  params: PaginationParams = {}
): Promise<PaginatedResponse<Admin>> => {
  return apiGetPaginated<Admin>(ADMIN_BASE_PATH, params)
}

// Get admin by ID
export const getAdminById = async (id: string): Promise<ApiResponse<Admin>> => {
  return apiGet<Admin>(`${ADMIN_BASE_PATH}/${id}`)
}

// Create new admin
export const createAdmin = async (
  data: CreateAdminInput
): Promise<ApiResponse<Admin>> => {
  return apiPost<Admin>(ADMIN_BASE_PATH, data)
}

// Update admin
export const updateAdmin = async (
  id: string,
  data: UpdateAdminInput
): Promise<ApiResponse<Admin>> => {
  return apiPut<Admin>(`${ADMIN_BASE_PATH}/${id}`, data)
}

// Update admin password
export const updateAdminPassword = async (
  id: string,
  newPassword: string
): Promise<ApiResponse<void>> => {
  return apiPatch<void>(`${ADMIN_BASE_PATH}/${id}/password`, { newPassword })
}

// Delete admin (soft delete)
export const deleteAdmin = async (id: string): Promise<ApiResponse<Admin>> => {
  return apiDelete<Admin>(`${ADMIN_BASE_PATH}/${id}`)
}

// Hard delete admin
export const hardDeleteAdmin = async (
  id: string
): Promise<ApiResponse<void>> => {
  return apiDelete<void>(`${ADMIN_BASE_PATH}/${id}/hard`)
}

// Get admin statistics
export const getAdminStats = async (): Promise<ApiResponse<any>> => {
  return apiGet<any>(`${ADMIN_BASE_PATH}/stats`)
}

// Search admins with advanced filters
export const searchAdmins = async (
  params: PaginationParams = {}
): Promise<PaginatedResponse<Admin>> => {
  return apiGetPaginated<Admin>(`${ADMIN_BASE_PATH}/search`, params)
}

// Get admins by role
export const getAdminsByRole = async (
  roleId: string,
  params: PaginationParams = {}
): Promise<PaginatedResponse<Admin>> => {
  return apiGetPaginated<Admin>(`${ADMIN_BASE_PATH}/role/${roleId}`, params)
}

// Get admins by role name
export const getAdminsByRoleName = async (
  roleName: string
): Promise<ApiResponse<Admin[]>> => {
  return apiGet<Admin[]>(`${ADMIN_BASE_PATH}/role-name/${roleName}`)
}
