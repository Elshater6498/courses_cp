import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { topicService } from '@/services/topicService';
import type {
  Topic,
  CreateTopicInput,
  UpdateTopicInput,
  TopicStats,
  ReorderTopicsInput,
  PaginationParams,
} from '@/types/api';

// Query keys
export const topicKeys = {
  all: ['topics'] as const,
  lists: () => [...topicKeys.all, 'list'] as const,
  list: (filters: PaginationParams) => [...topicKeys.lists(), filters] as const,
  details: () => [...topicKeys.all, 'detail'] as const,
  detail: (id: string) => [...topicKeys.details(), id] as const,
  byCourse: (courseId: string) => [...topicKeys.all, 'course', courseId] as const,
  stats: () => [...topicKeys.all, 'stats'] as const,
};

// Get all topics
export const useTopics = (params?: PaginationParams) => {
  return useQuery({
    queryKey: topicKeys.list(params || {}),
    queryFn: () => topicService.getTopics(params),
  });
};

// Get topics by course
export const useTopicsByCourse = (courseId: string, params?: PaginationParams) => {
  return useQuery({
    queryKey: [...topicKeys.byCourse(courseId), params],
    queryFn: () => topicService.getTopicsByCourse(courseId, params),
    enabled: !!courseId,
  });
};

// Get topic by ID
export const useTopic = (id: string) => {
  return useQuery({
    queryKey: topicKeys.detail(id),
    queryFn: () => topicService.getTopicById(id),
    enabled: !!id,
  });
};

// Get topic statistics
export const useTopicStats = () => {
  return useQuery({
    queryKey: topicKeys.stats(),
    queryFn: () => topicService.getTopicStats(),
  });
};

// Search topics
export const useSearchTopics = (query: string, params?: PaginationParams) => {
  return useQuery({
    queryKey: [...topicKeys.lists(), 'search', query, params],
    queryFn: () => topicService.searchTopics(query, params),
    enabled: !!query,
  });
};

// Get topics with discount
export const useTopicsWithDiscount = (params?: PaginationParams) => {
  return useQuery({
    queryKey: [...topicKeys.lists(), 'discount', params],
    queryFn: () => topicService.getTopicsWithDiscount(params),
  });
};

// Get topics by price range
export const useTopicsByPriceRange = (
  minPrice: number,
  maxPrice: number,
  params?: PaginationParams
) => {
  return useQuery({
    queryKey: [...topicKeys.lists(), 'price-range', minPrice, maxPrice, params],
    queryFn: () => topicService.getTopicsByPriceRange(minPrice, maxPrice, params),
    enabled: minPrice >= 0 && maxPrice >= minPrice,
  });
};

// Create topic
export const useCreateTopic = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTopicInput) => topicService.createTopic(data),
    onSuccess: (response) => {
      // Invalidate and refetch topics lists
      queryClient.invalidateQueries({ queryKey: topicKeys.lists() });
      
      // If the topic has a courseId, invalidate that course's topics
      if (response.data?.courseId && typeof response.data.courseId === 'object') {
        queryClient.invalidateQueries({
          queryKey: topicKeys.byCourse(response.data.courseId._id),
        });
      } else if (typeof response.data?.courseId === 'string') {
        queryClient.invalidateQueries({
          queryKey: topicKeys.byCourse(response.data.courseId),
        });
      }

      // Invalidate stats
      queryClient.invalidateQueries({ queryKey: topicKeys.stats() });
    },
  });
};

// Update topic
export const useUpdateTopic = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTopicInput }) =>
      topicService.updateTopic(id, data),
    onSuccess: (response) => {
      // Invalidate and refetch topics lists
      queryClient.invalidateQueries({ queryKey: topicKeys.lists() });
      
      // Invalidate the specific topic
      if (response.data?._id) {
        queryClient.invalidateQueries({ queryKey: topicKeys.detail(response.data._id) });
      }
      
      // If the topic has a courseId, invalidate that course's topics
      if (response.data?.courseId && typeof response.data.courseId === 'object') {
        queryClient.invalidateQueries({
          queryKey: topicKeys.byCourse(response.data.courseId._id),
        });
      } else if (typeof response.data?.courseId === 'string') {
        queryClient.invalidateQueries({
          queryKey: topicKeys.byCourse(response.data.courseId),
        });
      }

      // Invalidate stats
      queryClient.invalidateQueries({ queryKey: topicKeys.stats() });
    },
  });
};

// Delete topic
export const useDeleteTopic = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => topicService.deleteTopic(id),
    onSuccess: (_, deletedId) => {
      // Invalidate and refetch topics lists
      queryClient.invalidateQueries({ queryKey: topicKeys.lists() });
      
      // Remove the specific topic from cache
      queryClient.removeQueries({ queryKey: topicKeys.detail(deletedId) });
      
      // Invalidate stats
      queryClient.invalidateQueries({ queryKey: topicKeys.stats() });
    },
  });
};

// Toggle topic status
export const useToggleTopicStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      topicService.toggleTopicStatus(id, isActive),
    onSuccess: (response) => {
      // Invalidate and refetch topics lists
      queryClient.invalidateQueries({ queryKey: topicKeys.lists() });
      
      // Invalidate the specific topic
      if (response.data?._id) {
        queryClient.invalidateQueries({ queryKey: topicKeys.detail(response.data._id) });
      }
      
      // If the topic has a courseId, invalidate that course's topics
      if (response.data?.courseId && typeof response.data.courseId === 'object') {
        queryClient.invalidateQueries({
          queryKey: topicKeys.byCourse(response.data.courseId._id),
        });
      } else if (typeof response.data?.courseId === 'string') {
        queryClient.invalidateQueries({
          queryKey: topicKeys.byCourse(response.data.courseId),
        });
      }

      // Invalidate stats
      queryClient.invalidateQueries({ queryKey: topicKeys.stats() });
    },
  });
};

// Reorder topics
export const useReorderTopics = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ courseId, data }: { courseId: string; data: ReorderTopicsInput }) =>
      topicService.reorderTopics(courseId, data),
    onSuccess: (_, { courseId }) => {
      // Invalidate and refetch topics for this course
      queryClient.invalidateQueries({ queryKey: topicKeys.byCourse(courseId) });
      
      // Invalidate all topics lists
      queryClient.invalidateQueries({ queryKey: topicKeys.lists() });
    },
  });
}; 