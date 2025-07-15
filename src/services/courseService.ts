import { apiGet, apiPost, apiPut, apiDelete, apiPatch, apiGetPaginated } from './api';
import type {
  Course,
  CreateCourseInput,
  UpdateCourseInput,
  CourseStats,
  PaginatedResponse,
  PaginationParams,
  ApiResponse,
} from '@/types/api';

export const courseService = {
  // Get all courses with pagination and filtering
  async getCourses(params?: PaginationParams): Promise<PaginatedResponse<Course>> {
    return await apiGetPaginated<Course>('/dashboard/courses', params);
  },

  // Get course statistics
  async getCourseStats(): Promise<ApiResponse<CourseStats>> {
    return await apiGet<CourseStats>('/dashboard/courses/stats');
  },

  // Get course by ID
  async getCourseById(id: string): Promise<ApiResponse<Course>> {
    return await apiGet<Course>(`/dashboard/courses/${id}`);
  },

  // Create new course
  async createCourse(data: CreateCourseInput): Promise<ApiResponse<Course>> {
    return await apiPost<Course>('/dashboard/courses', data);
  },

  // Update course
  async updateCourse(id: string, data: UpdateCourseInput): Promise<ApiResponse<Course>> {
    return await apiPut<Course>(`/dashboard/courses/${id}`, data);
  },

  // Delete course
  async deleteCourse(id: string): Promise<ApiResponse<void>> {
    return await apiDelete(`/dashboard/courses/${id}`);
  },

  // Toggle course status
  async toggleCourseStatus(id: string, isActive: boolean): Promise<ApiResponse<Course>> {
    return await apiPatch<Course>(`/dashboard/courses/${id}/status`, { isActive });
  },

  // Get courses by faculty
  async getCoursesByFaculty(facultyId: string, params?: PaginationParams): Promise<PaginatedResponse<Course>> {
    return await apiGetPaginated<Course>(`/dashboard/courses/faculty/${facultyId}`, params);
  },

  // Get courses by instructor
  async getCoursesByInstructor(instructorId: string, params?: PaginationParams): Promise<PaginatedResponse<Course>> {
    return await apiGetPaginated<Course>(`/dashboard/courses/instructor/${instructorId}`, params);
  },

  // Search courses
  async searchCourses(query: string, params?: PaginationParams): Promise<PaginatedResponse<Course>> {
    return await apiGetPaginated<Course>('/dashboard/courses/search', { q: query, ...params });
  },
}; 