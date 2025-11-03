import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { addSection, getFreeCourseById,updateSection,deleteSection } from '@/services/free-course-service';
import type { CreateSectionInput, UpdateSectionInput } from '@/types/api';
import { toast } from 'sonner';

// Query keys
export const sectionKeys = {
  all: ['sections'] as const,
  byFreeCourse: (freeCourseId: string) => ['sections', 'freeCourse', freeCourseId] as const,
  detail: (freeCourseId: string, sectionId: string) => ['sections', 'freeCourse', freeCourseId, sectionId] as const,
};

/**
 * Hook to get all sections for a free course
 */
export function useSections(freeCourseId: string) {
  return useQuery({
    queryKey: sectionKeys.byFreeCourse(freeCourseId),
    queryFn: async () => {
      const freeCourse = await getFreeCourseById(freeCourseId);
      return freeCourse.data?.sections || [];
    },
    enabled: !!freeCourseId,
  });
}

/**
 * Hook to get a single section
 */
export function useSection(freeCourseId: string, sectionId: string) {
  return useQuery({
    queryKey: sectionKeys.detail(freeCourseId, sectionId),
    queryFn: async () => {
      const freeCourse = await getFreeCourseById(freeCourseId);
      const section = freeCourse.data?.sections?.find((s) => s._id === sectionId);
      if (!section) {
        throw new Error('Section not found');
      }
      return section;
    },
    enabled: !!freeCourseId && !!sectionId,
  });
}

/**
 * Hook to create a new section
 */
export function useCreateSection(freeCourseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSectionInput) =>
      addSection(freeCourseId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sectionKeys.byFreeCourse(freeCourseId) });
      queryClient.invalidateQueries({ queryKey: ['freeCourses'] });
      toast.success('Section created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create section');
    },
  });
}

/**
 * Hook to update a section
 */
export function useUpdateSection(freeCourseId: string, sectionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateSectionInput) =>
      updateSection(freeCourseId, sectionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sectionKeys.byFreeCourse(freeCourseId) });
      queryClient.invalidateQueries({ queryKey: sectionKeys.detail(freeCourseId, sectionId) });
      queryClient.invalidateQueries({ queryKey: ['freeCourses'] });
      toast.success('Section updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update section');
    },
  });
}

/**
 * Hook to delete a section
 */
export function useDeleteSection(freeCourseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sectionId: string) =>
      deleteSection(freeCourseId, sectionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sectionKeys.byFreeCourse(freeCourseId) });
      queryClient.invalidateQueries({ queryKey: ['freeCourses'] });
      toast.success('Section deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete section');
    },
  });
}
