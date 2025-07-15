import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { courseService } from '@/services/courseService';
import { facultyService } from '@/services/facultyService';
import { getAdmins } from '@/services/adminService';
import type {
  Course,
  CreateCourseInput,
  UpdateCourseInput,
  CourseStats,
  PaginationParams,
  Faculty,
  Admin,
} from '@/types/api';

// Query keys
export const courseKeys = {
  all: ['courses'] as const,
  lists: () => [...courseKeys.all, 'list'] as const,
  list: (params: PaginationParams) => [...courseKeys.lists(), params] as const,
  details: () => [...courseKeys.all, 'detail'] as const,
  detail: (id: string) => [...courseKeys.details(), id] as const,
  stats: () => [...courseKeys.all, 'stats'] as const,
  byFaculty: (facultyId: string, params?: PaginationParams) => 
    [...courseKeys.all, 'faculty', facultyId, params] as const,
  byInstructor: (instructorId: string, params?: PaginationParams) => 
    [...courseKeys.all, 'instructor', instructorId, params] as const,
  search: (query: string, params?: PaginationParams) => 
    [...courseKeys.all, 'search', query, params] as const,
};

// Get all courses
export const useCourses = (params?: PaginationParams) => {
  return useQuery({
    queryKey: courseKeys.list(params || {}),
    queryFn: () => courseService.getCourses(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get course statistics
export const useCourseStats = () => {
  return useQuery({
    queryKey: courseKeys.stats(),
    queryFn: () => courseService.getCourseStats(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Get course by ID
export const useCourse = (id: string) => {
  return useQuery({
    queryKey: courseKeys.detail(id),
    queryFn: () => courseService.getCourseById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get courses by faculty
export const useCoursesByFaculty = (facultyId: string, params?: PaginationParams) => {
  return useQuery({
    queryKey: courseKeys.byFaculty(facultyId, params),
    queryFn: () => courseService.getCoursesByFaculty(facultyId, params),
    enabled: !!facultyId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get courses by instructor
export const useCoursesByInstructor = (instructorId: string, params?: PaginationParams) => {
  return useQuery({
    queryKey: courseKeys.byInstructor(instructorId, params),
    queryFn: () => courseService.getCoursesByInstructor(instructorId, params),
    enabled: !!instructorId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Search courses
export const useSearchCourses = (query: string, params?: PaginationParams) => {
  return useQuery({
    queryKey: courseKeys.search(query, params),
    queryFn: () => courseService.searchCourses(query, params),
    enabled: !!query && query.length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Get all faculties (for course creation/editing)
export const useAllFaculties = () => {
  return useQuery({
    queryKey: ['faculties', 'all'],
    queryFn: () => facultyService.getAllFaculties(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Get all admins (for instructor selection)
export const useAllAdmins = () => {
  return useQuery({
    queryKey: ['admins', 'all'],
    queryFn: () => getAdmins({ limit: 1000 }), // Get all admins
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Create course mutation
export const useCreateCourse = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateCourseInput) => courseService.createCourse(data),
    onSuccess: () => {
      // Invalidate and refetch courses list
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() });
      queryClient.invalidateQueries({ queryKey: courseKeys.stats() });
    },
  });
};

// Update course mutation
export const useUpdateCourse = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCourseInput }) =>
      courseService.updateCourse(id, data),
    onSuccess: (_, { id }) => {
      // Invalidate and refetch specific course and courses list
      queryClient.invalidateQueries({ queryKey: courseKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() });
      queryClient.invalidateQueries({ queryKey: courseKeys.stats() });
    },
  });
};

// Delete course mutation
export const useDeleteCourse = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => courseService.deleteCourse(id),
    onSuccess: () => {
      // Invalidate and refetch courses list and stats
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() });
      queryClient.invalidateQueries({ queryKey: courseKeys.stats() });
    },
  });
};

// Toggle course status mutation
export const useToggleCourseStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      courseService.toggleCourseStatus(id, isActive),
    onSuccess: (_, { id }) => {
      // Invalidate and refetch specific course and courses list
      queryClient.invalidateQueries({ queryKey: courseKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() });
      queryClient.invalidateQueries({ queryKey: courseKeys.stats() });
    },
  });
}; 