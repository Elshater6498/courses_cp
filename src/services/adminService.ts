import type { 
  Admin, 
  CreateAdminInput, 
  UpdateAdminInput, 
  PaginationParams, 
  PaginatedResponse, 
  ApiResponse 
} from '../types/api';
import { apiService } from './api';

export class AdminService {
  private readonly basePath = '/dashboard/admin';

  // Get all admins with pagination
  async getAdmins(params: PaginationParams = {}): Promise<PaginatedResponse<Admin>> {
    return apiService.getPaginated<Admin>(this.basePath, params);
  }

  // Get admin by ID
  async getAdminById(id: string): Promise<ApiResponse<Admin>> {
    return apiService.get<Admin>(`${this.basePath}/${id}`);
  }

  // Create new admin
  async createAdmin(data: CreateAdminInput): Promise<ApiResponse<Admin>> {
    return apiService.post<Admin>(this.basePath, data);
  }

  // Update admin
  async updateAdmin(id: string, data: UpdateAdminInput): Promise<ApiResponse<Admin>> {
    return apiService.put<Admin>(`${this.basePath}/${id}`, data);
  }

  // Update admin password
  async updateAdminPassword(id: string, newPassword: string): Promise<ApiResponse<void>> {
    return apiService.patch<void>(`${this.basePath}/${id}/password`, { newPassword });
  }

  // Delete admin (soft delete)
  async deleteAdmin(id: string): Promise<ApiResponse<Admin>> {
    return apiService.delete<Admin>(`${this.basePath}/${id}`);
  }

  // Hard delete admin
  async hardDeleteAdmin(id: string): Promise<ApiResponse<void>> {
    return apiService.delete<void>(`${this.basePath}/${id}/hard`);
  }

  // Get admin statistics
  async getAdminStats(): Promise<ApiResponse<any>> {
    return apiService.get<any>(`${this.basePath}/stats`);
  }

  // Search admins with advanced filters
  async searchAdmins(params: PaginationParams = {}): Promise<PaginatedResponse<Admin>> {
    return apiService.getPaginated<Admin>(`${this.basePath}/search`, params);
  }

  // Get admins by role
  async getAdminsByRole(roleId: string, params: PaginationParams = {}): Promise<PaginatedResponse<Admin>> {
    return apiService.getPaginated<Admin>(`${this.basePath}/role/${roleId}`, params);
  }
}

export const adminService = new AdminService(); 