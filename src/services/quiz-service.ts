import { apiGet, apiPost, apiPut, apiDelete, apiGetPaginated } from './api';
import type {
  Quiz,
  CreateQuizInput,
  UpdateQuizInput,
  QuizStatistics,
  QuizLeaderboardEntry,
  QuizQueryParams,
  PaginatedResponse,
  ApiResponse,
  DuplicateQuizInput,
} from '@/types/api';

export const quizService = {
  // Get all quizzes with pagination and filtering
  async getQuizzes(params?: QuizQueryParams): Promise<PaginatedResponse<Quiz>> {
    return await apiGetPaginated<Quiz>('/dashboard/quizzes', params);
  },

  // Get quiz by ID
  async getQuizById(id: string): Promise<ApiResponse<Quiz>> {
    return await apiGet<Quiz>(`/dashboard/quizzes/${id}`);
  },

  // Create new quiz
  async createQuiz(data: CreateQuizInput): Promise<ApiResponse<Quiz>> {
    return await apiPost<Quiz>('/dashboard/quizzes', data);
  },

  // Update quiz
  async updateQuiz(id: string, data: UpdateQuizInput): Promise<ApiResponse<Quiz>> {
    return await apiPut<Quiz>(`/dashboard/quizzes/${id}`, data);
  },

  // Delete quiz
  async deleteQuiz(id: string): Promise<ApiResponse<void>> {
    return await apiDelete(`/dashboard/quizzes/${id}`);
  },

  // Get quiz statistics
  async getQuizStatistics(id: string): Promise<ApiResponse<QuizStatistics>> {
    return await apiGet<QuizStatistics>(`/dashboard/quizzes/${id}/statistics`);
  },

  // Get quiz leaderboard
  async getQuizLeaderboard(id: string, limit: number = 10): Promise<ApiResponse<QuizLeaderboardEntry[]>> {
    return await apiGet<QuizLeaderboardEntry[]>(`/dashboard/quizzes/${id}/leaderboard?limit=${limit}`);
  },

  // Get quizzes by entity (course, topic, or lesson)
  async getQuizzesByEntity(entityType: string, entityId: string): Promise<PaginatedResponse<Quiz>> {
    return await apiGetPaginated<Quiz>('/dashboard/quizzes', {
      quizType: entityType,
      entityId: entityId,
    });
  },

  // Duplicate quiz
  async duplicateQuiz(id: string, data: DuplicateQuizInput): Promise<ApiResponse<Quiz>> {
    return await apiPost<Quiz>(`/dashboard/quizzes/${id}/duplicate`, data);
  },
};
