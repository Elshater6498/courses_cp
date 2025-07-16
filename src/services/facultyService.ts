import type { 
  Faculty, 
  CreateFacultyInput, 
  UpdateFacultyInput,
  ApiResponse,
  PaginatedResponse,
  PaginationParams 
} from '../types/api';
import { apiGet, apiPost, apiPut, apiDelete, apiGetPaginated } from './api';

// Faculty service functions
export const facultyService = {
  // Get all faculties with pagination
  async getFaculties(params?: PaginationParams): Promise<PaginatedResponse<Faculty>> {
    return apiGetPaginated<Faculty>('/dashboard/faculties', params);
  },

  // Get all faculties without pagination
  async getAllFaculties(): Promise<ApiResponse<Faculty[]>> {
    return apiGet<Faculty[]>('/dashboard/faculties/all');
  },

  // Get faculties grouped by university
  async getFacultiesGroupedByUniversity(): Promise<ApiResponse<Array<{
    universityId: string;
    universityName: {
      en: string;
      ar: string;
      he: string;
    };
    faculties: Faculty[];
  }>>> {
    return apiGet<Array<{
      universityId: string;
      universityName: {
        en: string;
        ar: string;
        he: string;
      };
      faculties: Faculty[];
    }>>('/dashboard/faculties/grouped-by-university');
  },

  // Get faculties by university ID
  async getFacultiesByUniversity(universityId: string): Promise<ApiResponse<Faculty[]>> {
    return apiGet<Faculty[]>(`/dashboard/faculties/university/${universityId}`);
  },

  // Get faculty by ID
  async getFacultyById(id: string): Promise<ApiResponse<Faculty>> {
    return apiGet<Faculty>(`/dashboard/faculties/${id}`);
  },

  // Create faculty
  async createFaculty(data: CreateFacultyInput): Promise<ApiResponse<Faculty>> {
    return apiPost<Faculty>('/dashboard/faculties', data);
  },

  // Update faculty
  async updateFaculty(id: string, data: UpdateFacultyInput): Promise<ApiResponse<Faculty>> {
    return apiPut<Faculty>(`/dashboard/faculties/${id}`, data);
  },

  // Delete faculty (soft delete)
  async deleteFaculty(id: string): Promise<ApiResponse<Faculty>> {
    return apiDelete<Faculty>(`/dashboard/faculties/${id}`);
  },

  // Hard delete faculty
  async hardDeleteFaculty(id: string): Promise<ApiResponse<{ success: boolean; message: string }>> {
    return apiDelete<{ success: boolean; message: string }>(`/dashboard/faculties/${id}/hard`);
  },

  // Get faculty statistics
  async getFacultyStats(): Promise<ApiResponse<{
    totalFaculties: number;
    activeFaculties: number;
    inactiveFaculties: number;
    facultiesByUniversity: Array<{
      universityId: string;
      universityName: string;
      count: number;
    }>;
  }>> {
    return apiGet('/dashboard/faculties/stats');
  },

  // Search faculties
  async searchFaculties(params?: PaginationParams): Promise<PaginatedResponse<Faculty>> {
    return apiGetPaginated<Faculty>('/dashboard/faculties/search', params);
  },
}; 