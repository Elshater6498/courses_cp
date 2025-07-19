import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { facultyService } from '../services/faculty-service';
import type { 
  Faculty, 
  CreateFacultyInput, 
  UpdateFacultyInput,
  PaginationParams 
} from '../types/api';

// Query keys
export const facultyKeys = {
  all: ['faculties'] as const,
  lists: () => [...facultyKeys.all, 'list'] as const,
  list: (params?: PaginationParams) => [...facultyKeys.lists(), params] as const,
  details: () => [...facultyKeys.all, 'detail'] as const,
  detail: (id: string) => [...facultyKeys.details(), id] as const,
  stats: () => [...facultyKeys.all, 'stats'] as const,
  byUniversity: (universityId: string) => [...facultyKeys.all, 'university', universityId] as const,
  allWithoutPagination: () => [...facultyKeys.all, 'all'] as const,
};

// Get faculties with pagination
export const useFaculties = (params?: PaginationParams) => {
  return useQuery({
    queryKey: facultyKeys.list(params),
    queryFn: () => facultyService.getFaculties(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get all faculties without pagination
export const useAllFaculties = () => {
  return useQuery({
    queryKey: facultyKeys.allWithoutPagination(),
    queryFn: () => facultyService.getAllFaculties(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Get faculties by university
export const useFacultiesByUniversity = (universityId: string) => {
  return useQuery({
    queryKey: facultyKeys.byUniversity(universityId),
    queryFn: () => facultyService.getFacultiesByUniversity(universityId),
    enabled: !!universityId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get faculty by ID
export const useFacultyById = (id: string) => {
  return useQuery({
    queryKey: facultyKeys.detail(id),
    queryFn: () => facultyService.getFacultyById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get faculty statistics
export const useFacultyStats = () => {
  return useQuery({
    queryKey: facultyKeys.stats(),
    queryFn: () => facultyService.getFacultyStats(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Create faculty mutation
export const useCreateFaculty = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateFacultyInput) => facultyService.createFaculty(data),
    onSuccess: () => {
      // Invalidate and refetch faculty-related queries
      queryClient.invalidateQueries({ queryKey: facultyKeys.all });
    },
  });
};

// Update faculty mutation
export const useUpdateFaculty = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateFacultyInput }) =>
      facultyService.updateFaculty(id, data),
    onSuccess: (_, { id }) => {
      // Invalidate and refetch faculty-related queries
      queryClient.invalidateQueries({ queryKey: facultyKeys.all });
      queryClient.invalidateQueries({ queryKey: facultyKeys.detail(id) });
    },
  });
};

// Delete faculty mutation (soft delete)
export const useDeleteFaculty = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => facultyService.deleteFaculty(id),
    onSuccess: () => {
      // Invalidate and refetch faculty-related queries
      queryClient.invalidateQueries({ queryKey: facultyKeys.all });
    },
  });
};

// Hard delete faculty mutation
export const useHardDeleteFaculty = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => facultyService.hardDeleteFaculty(id),
    onSuccess: () => {
      // Invalidate and refetch faculty-related queries
      queryClient.invalidateQueries({ queryKey: facultyKeys.all });
    },
  });
}; 