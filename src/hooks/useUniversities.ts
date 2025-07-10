import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { universityService } from '../services/universityService';
import type { 
  University, 
  CreateUniversityInput, 
  UpdateUniversityInput, 
  PaginationParams 
} from '../types/api';

// Query keys
const UNIVERSITY_QUERY_KEYS = {
  UNIVERSITIES: 'universities',
  UNIVERSITY_STATS: 'university-stats',
  ALL_UNIVERSITIES: 'all-universities',
} as const;

// Hook for getting paginated universities
export const useUniversities = (params: PaginationParams = {}) => {
  return useQuery({
    queryKey: [UNIVERSITY_QUERY_KEYS.UNIVERSITIES, params],
    queryFn: () => universityService.getUniversities(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook for getting all universities without pagination
export const useAllUniversities = () => {
  return useQuery({
    queryKey: [UNIVERSITY_QUERY_KEYS.ALL_UNIVERSITIES],
    queryFn: () => universityService.getAllUniversities(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook for getting university by ID
export const useUniversityById = (id: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: [UNIVERSITY_QUERY_KEYS.UNIVERSITIES, id],
    queryFn: () => universityService.getUniversityById(id),
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
  });
};

// Hook for getting university statistics
export const useUniversityStats = () => {
  return useQuery({
    queryKey: [UNIVERSITY_QUERY_KEYS.UNIVERSITY_STATS],
    queryFn: () => universityService.getUniversityStats(),
    staleTime: 5 * 60 * 1000,
  });
};

// Hook for creating university
export const useCreateUniversity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUniversityInput) => universityService.createUniversity(data),
    onSuccess: () => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: [UNIVERSITY_QUERY_KEYS.UNIVERSITIES] });
      queryClient.invalidateQueries({ queryKey: [UNIVERSITY_QUERY_KEYS.ALL_UNIVERSITIES] });
      queryClient.invalidateQueries({ queryKey: [UNIVERSITY_QUERY_KEYS.UNIVERSITY_STATS] });
    },
  });
};

// Hook for updating university
export const useUpdateUniversity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUniversityInput }) => 
      universityService.updateUniversity(id, data),
    onSuccess: () => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: [UNIVERSITY_QUERY_KEYS.UNIVERSITIES] });
      queryClient.invalidateQueries({ queryKey: [UNIVERSITY_QUERY_KEYS.ALL_UNIVERSITIES] });
      queryClient.invalidateQueries({ queryKey: [UNIVERSITY_QUERY_KEYS.UNIVERSITY_STATS] });
    },
  });
};

// Hook for deleting university (soft delete)
export const useDeleteUniversity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => universityService.deleteUniversity(id),
    onSuccess: () => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: [UNIVERSITY_QUERY_KEYS.UNIVERSITIES] });
      queryClient.invalidateQueries({ queryKey: [UNIVERSITY_QUERY_KEYS.ALL_UNIVERSITIES] });
      queryClient.invalidateQueries({ queryKey: [UNIVERSITY_QUERY_KEYS.UNIVERSITY_STATS] });
    },
  });
};

// Hook for hard deleting university
export const useHardDeleteUniversity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => universityService.hardDeleteUniversity(id),
    onSuccess: () => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: [UNIVERSITY_QUERY_KEYS.UNIVERSITIES] });
      queryClient.invalidateQueries({ queryKey: [UNIVERSITY_QUERY_KEYS.ALL_UNIVERSITIES] });
      queryClient.invalidateQueries({ queryKey: [UNIVERSITY_QUERY_KEYS.UNIVERSITY_STATS] });
    },
  });
};

// Hook for searching universities
export const useSearchUniversities = (params: PaginationParams = {}) => {
  return useQuery({
    queryKey: [UNIVERSITY_QUERY_KEYS.UNIVERSITIES, 'search', params],
    queryFn: () => universityService.searchUniversities(params),
    enabled: !!params.search, // Only run when there's a search term
    staleTime: 2 * 60 * 1000, // 2 minutes for search results
  });
}; 