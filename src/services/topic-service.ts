import { apiGet, apiPost, apiPut, apiDelete, apiPatch, apiGetPaginated } from './api';
import type {
  Topic,
  CreateTopicInput,
  UpdateTopicInput,
  TopicStats,
  ReorderTopicsInput,
  PaginationParams,
  PaginatedResponse,
  ApiResponse,
} from '@/types/api';

export const topicService = {
  // Get all topics with pagination and filtering
  async getTopics(params?: PaginationParams): Promise<PaginatedResponse<Topic>> {
    return await apiGetPaginated<Topic>('/dashboard/topics', params);
  },

  // Get topics by course ID
  async getTopicsByCourse(
    courseId: string,
    params?: PaginationParams
  ): Promise<PaginatedResponse<Topic>> {
    return await apiGetPaginated<Topic>(`/dashboard/topics/course/${courseId}`, params);
  },

  // Get topic by ID
  async getTopicById(id: string): Promise<ApiResponse<Topic>> {
    return await apiGet<Topic>(`/dashboard/topics/${id}`);
  },

  // Create new topic
  async createTopic(data: CreateTopicInput): Promise<ApiResponse<Topic>> {
    return await apiPost<Topic>('/dashboard/topics', data);
  },

  // Update topic
  async updateTopic(id: string, data: UpdateTopicInput): Promise<ApiResponse<Topic>> {
    return await apiPut<Topic>(`/dashboard/topics/${id}`, data);
  },

  // Delete topic
  async deleteTopic(id: string): Promise<ApiResponse<void>> {
    return await apiDelete(`/dashboard/topics/${id}`);
  },

  // Toggle topic status
  async toggleTopicStatus(id: string, isActive: boolean): Promise<ApiResponse<Topic>> {
    return await apiPatch<Topic>(`/dashboard/topics/${id}/status`, { isActive });
  },

  // Get topic statistics
  async getTopicStats(): Promise<ApiResponse<TopicStats>> {
    return await apiGet<TopicStats>('/dashboard/topics/stats');
  },

  // Search topics
  async searchTopics(
    query: string,
    params?: PaginationParams
  ): Promise<PaginatedResponse<Topic>> {
    return await apiGetPaginated<Topic>('/dashboard/topics/search', { q: query, ...params });
  },

  // Get topics with discount
  async getTopicsWithDiscount(params?: PaginationParams): Promise<PaginatedResponse<Topic>> {
    return await apiGetPaginated<Topic>('/dashboard/topics/discount', params);
  },

  // Get topics by price range
  async getTopicsByPriceRange(
    minPrice: number,
    maxPrice: number,
    params?: PaginationParams
  ): Promise<PaginatedResponse<Topic>> {
    return await apiGetPaginated<Topic>('/dashboard/topics/price-range', { minPrice, maxPrice, ...params });
  },

  // Reorder topics within a course
  async reorderTopics(courseId: string, data: ReorderTopicsInput): Promise<ApiResponse<Topic[]>> {
    return await apiPatch<Topic[]>(`/dashboard/topics/course/${courseId}/reorder`, data);
  },
}; 