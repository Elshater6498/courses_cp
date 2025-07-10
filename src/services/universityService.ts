import { apiGet, apiPost, apiPut, apiDelete, apiGetPaginated } from './api';
import type { 
  University, 
  CreateUniversityInput, 
  UpdateUniversityInput, 
  PaginatedResponse, 
  ApiResponse,
  PaginationParams 
} from '../types/api';

// University API endpoints
const UNIVERSITY_ENDPOINTS = {
  UNIVERSITIES: 'dashboard/universities',
  UNIVERSITY_BY_ID: (id: string) => `dashboard/universities/${id}`,
  UNIVERSITY_STATS: 'dashboard/universities/stats',
  ALL_UNIVERSITIES: 'dashboard/universities/all',
  SEARCH_UNIVERSITIES: 'dashboard/universities/search',
  HARD_DELETE: (id: string) => `dashboard/universities/${id}/hard`,
} as const;

// University service functions
export const universityService = {
  // Get paginated universities
  getUniversities: async (params: PaginationParams): Promise<PaginatedResponse<University>> => {
    return apiGetPaginated<University>(UNIVERSITY_ENDPOINTS.UNIVERSITIES, params);
  },

  // Get all universities without pagination
  getAllUniversities: async (): Promise<ApiResponse<University[]>> => {
    return apiGet<University[]>(UNIVERSITY_ENDPOINTS.ALL_UNIVERSITIES);
  },

  // Get university by ID
  getUniversityById: async (id: string): Promise<ApiResponse<University>> => {
    return apiGet<University>(UNIVERSITY_ENDPOINTS.UNIVERSITY_BY_ID(id));
  },

  // Create university
  createUniversity: async (data: CreateUniversityInput): Promise<ApiResponse<University>> => {
    return apiPost<University>(UNIVERSITY_ENDPOINTS.UNIVERSITIES, data);
  },

  // Update university
  updateUniversity: async (id: string, data: UpdateUniversityInput): Promise<ApiResponse<University>> => {
    return apiPut<University>(UNIVERSITY_ENDPOINTS.UNIVERSITY_BY_ID(id), data);
  },

  // Delete university (soft delete)
  deleteUniversity: async (id: string): Promise<ApiResponse<University>> => {
    return apiDelete<University>(UNIVERSITY_ENDPOINTS.UNIVERSITY_BY_ID(id));
  },

  // Hard delete university
  hardDeleteUniversity: async (id: string): Promise<ApiResponse<any>> => {
    return apiDelete<any>(UNIVERSITY_ENDPOINTS.HARD_DELETE(id));
  },

  // Get university statistics
  getUniversityStats: async (): Promise<ApiResponse<{
    totalUniversities: number;
    activeUniversities: number;
    inactiveUniversities: number;
  }>> => {
    return apiGet(UNIVERSITY_ENDPOINTS.UNIVERSITY_STATS);
  },

  // Search universities
  searchUniversities: async (params: PaginationParams): Promise<PaginatedResponse<University>> => {
    return apiGetPaginated<University>(UNIVERSITY_ENDPOINTS.SEARCH_UNIVERSITIES, params);
  },
}; 