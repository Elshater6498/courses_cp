import { apiGet, apiPost, apiPut, apiDelete, apiPatch, apiGetPaginated } from './api';
import type {
  Lesson,
  CreateLessonInput,
  UpdateLessonInput,
  LessonStats,
  ReorderLessonsInput,
  PaginationParams,
  PaginatedResponse,
  ApiResponse,
} from '@/types/api';

export const lessonService = {
  // Get all lessons with pagination and filtering
  async getLessons(params?: PaginationParams): Promise<PaginatedResponse<Lesson>> {
    return await apiGetPaginated<Lesson>('/dashboard/lessons', params);
  },

  // Get lessons by topic ID
  async getLessonsByTopicId(
    topicId: string,
    params?: PaginationParams
  ): Promise<PaginatedResponse<Lesson>> {
    return await apiGetPaginated<Lesson>(`/dashboard/lessons/topic/${topicId}`, params);
  },

  // Get lesson by ID
  async getLessonById(id: string): Promise<ApiResponse<Lesson>> {
    return await apiGet<Lesson>(`/dashboard/lessons/${id}`);
  },

  // Create new lesson
  async createLesson(data: CreateLessonInput): Promise<ApiResponse<Lesson>> {
    return await apiPost<Lesson>('/dashboard/lessons', data);
  },

  // Update lesson
  async updateLesson(id: string, data: UpdateLessonInput): Promise<ApiResponse<Lesson>> {
    return await apiPut<Lesson>(`/dashboard/lessons/${id}`, data);
  },

  // Delete lesson
  async deleteLesson(id: string): Promise<ApiResponse<void>> {
    return await apiDelete(`/dashboard/lessons/${id}`);
  },

  // Toggle lesson status
  async toggleLessonStatus(id: string, isActive: boolean): Promise<ApiResponse<Lesson>> {
    return await apiPatch<Lesson>(`/dashboard/lessons/${id}/status`, { isActive });
  },

  // Get lesson statistics
  async getLessonStats(): Promise<ApiResponse<LessonStats>> {
    return await apiGet<LessonStats>('/dashboard/lessons/stats');
  },

  // Search lessons
  async searchLessons(
    query: string,
    params?: PaginationParams
  ): Promise<PaginatedResponse<Lesson>> {
    return await apiGetPaginated<Lesson>('/dashboard/lessons/search', { q: query, ...params });
  },

  // Reorder lessons within a topic
  async reorderLessons(topicId: string, data: ReorderLessonsInput): Promise<ApiResponse<Lesson[]>> {
    return await apiPost<Lesson[]>(`/dashboard/lessons/topic/${topicId}/reorder`, data);
  },

  // Move lesson to specific position
  async moveLessonToPosition(lessonId: string, position: number): Promise<ApiResponse<Lesson[]>> {
    return await apiPatch<Lesson[]>(`/dashboard/lessons/${lessonId}/move`, { position });
  },
}; 