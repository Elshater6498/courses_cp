import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { lessonService } from '@/services/lessonService';
import type {
  Lesson,
  CreateLessonInput,
  UpdateLessonInput,
  LessonStats,
  ReorderLessonsInput,
  PaginationParams,
} from '@/types/api';

// Query keys
export const lessonKeys = {
  all: ['lessons'] as const,
  lists: () => [...lessonKeys.all, 'list'] as const,
  list: (filters: PaginationParams) => [...lessonKeys.lists(), filters] as const,
  details: () => [...lessonKeys.all, 'detail'] as const,
  detail: (id: string) => [...lessonKeys.details(), id] as const,
  byTopic: (topicId: string) => [...lessonKeys.all, 'topic', topicId] as const,
  stats: () => [...lessonKeys.all, 'stats'] as const,
};

// Get all lessons
export const useLessons = (params?: PaginationParams) => {
  return useQuery({
    queryKey: lessonKeys.list(params || {}),
    queryFn: () => lessonService.getLessons(params),
  });
};

// Get lessons by topic
export const useLessonsByTopic = (topicId: string, params?: PaginationParams) => {
  return useQuery({
    queryKey: [...lessonKeys.byTopic(topicId), params],
    queryFn: () => lessonService.getLessonsByTopicId(topicId, params),
    enabled: !!topicId,
  });
};

// Get lesson by ID
export const useLesson = (id: string) => {
  return useQuery({
    queryKey: lessonKeys.detail(id),
    queryFn: () => lessonService.getLessonById(id),
    enabled: !!id,
  });
};

// Get lesson statistics
export const useLessonStats = () => {
  return useQuery({
    queryKey: lessonKeys.stats(),
    queryFn: () => lessonService.getLessonStats(),
  });
};

// Search lessons
export const useSearchLessons = (query: string, params?: PaginationParams) => {
  return useQuery({
    queryKey: [...lessonKeys.lists(), 'search', query, params],
    queryFn: () => lessonService.searchLessons(query, params),
    enabled: !!query,
  });
};

// Create lesson
export const useCreateLesson = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateLessonInput) => lessonService.createLesson(data),
    onSuccess: (response) => {
      // Invalidate and refetch lessons lists
      queryClient.invalidateQueries({ queryKey: lessonKeys.lists() });
      
      // If the lesson has a topicId, invalidate that topic's lessons
      if (response.data?.topicId && typeof response.data.topicId === 'object') {
        queryClient.invalidateQueries({
          queryKey: lessonKeys.byTopic(response.data.topicId._id),
        });
      } else if (typeof response.data?.topicId === 'string') {
        queryClient.invalidateQueries({
          queryKey: lessonKeys.byTopic(response.data.topicId),
        });
      }

      // Invalidate stats
      queryClient.invalidateQueries({ queryKey: lessonKeys.stats() });
    },
  });
};

// Update lesson
export const useUpdateLesson = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLessonInput }) =>
      lessonService.updateLesson(id, data),
    onSuccess: (response) => {
      // Invalidate and refetch lessons lists
      queryClient.invalidateQueries({ queryKey: lessonKeys.lists() });
      
      // Invalidate the specific lesson
      if (response.data?._id) {
        queryClient.invalidateQueries({ queryKey: lessonKeys.detail(response.data._id) });
      }
      
      // If the lesson has a topicId, invalidate that topic's lessons
      if (response.data?.topicId && typeof response.data.topicId === 'object') {
        queryClient.invalidateQueries({
          queryKey: lessonKeys.byTopic(response.data.topicId._id),
        });
      } else if (typeof response.data?.topicId === 'string') {
        queryClient.invalidateQueries({
          queryKey: lessonKeys.byTopic(response.data.topicId),
        });
      }

      // Invalidate stats
      queryClient.invalidateQueries({ queryKey: lessonKeys.stats() });
    },
  });
};

// Delete lesson
export const useDeleteLesson = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => lessonService.deleteLesson(id),
    onSuccess: (_, deletedId) => {
      // Invalidate and refetch lessons lists
      queryClient.invalidateQueries({ queryKey: lessonKeys.lists() });
      
      // Remove the specific lesson from cache
      queryClient.removeQueries({ queryKey: lessonKeys.detail(deletedId) });
      
      // Invalidate stats
      queryClient.invalidateQueries({ queryKey: lessonKeys.stats() });
    },
  });
};

// Toggle lesson status
export const useToggleLessonStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      lessonService.toggleLessonStatus(id, isActive),
    onSuccess: (response) => {
      // Invalidate and refetch lessons lists
      queryClient.invalidateQueries({ queryKey: lessonKeys.lists() });
      
      // Invalidate the specific lesson
      if (response.data?._id) {
        queryClient.invalidateQueries({ queryKey: lessonKeys.detail(response.data._id) });
      }
      
      // If the lesson has a topicId, invalidate that topic's lessons
      if (response.data?.topicId && typeof response.data.topicId === 'object') {
        queryClient.invalidateQueries({
          queryKey: lessonKeys.byTopic(response.data.topicId._id),
        });
      } else if (typeof response.data?.topicId === 'string') {
        queryClient.invalidateQueries({
          queryKey: lessonKeys.byTopic(response.data.topicId),
        });
      }

      // Invalidate stats
      queryClient.invalidateQueries({ queryKey: lessonKeys.stats() });
    },
  });
};

// Reorder lessons
export const useReorderLessons = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ topicId, data }: { topicId: string; data: ReorderLessonsInput }) =>
      lessonService.reorderLessons(topicId, data),
    onSuccess: (_, { topicId }) => {
      // Invalidate and refetch lessons for this topic
      queryClient.invalidateQueries({ queryKey: lessonKeys.byTopic(topicId) });
      
      // Invalidate all lessons lists
      queryClient.invalidateQueries({ queryKey: lessonKeys.lists() });
    },
  });
};

// Move lesson to position
export const useMoveLessonToPosition = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ lessonId, position }: { lessonId: string; position: number }) =>
      lessonService.moveLessonToPosition(lessonId, position),
    onSuccess: (response) => {
      // Invalidate and refetch lessons lists
      queryClient.invalidateQueries({ queryKey: lessonKeys.lists() });
      
      // If the lesson has a topicId, invalidate that topic's lessons
      if (response.data?.[0]?.topicId && typeof response.data[0].topicId === 'object') {
        queryClient.invalidateQueries({
          queryKey: lessonKeys.byTopic(response.data[0].topicId._id),
        });
      } else if (typeof response.data?.[0]?.topicId === 'string') {
        queryClient.invalidateQueries({
          queryKey: lessonKeys.byTopic(response.data[0].topicId),
        });
      }
    },
  });
}; 