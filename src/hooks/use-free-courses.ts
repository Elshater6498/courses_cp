import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getFreeCourses,
  getFreeCourseById,
  getFreeCoursesByUniversity,
  getFreeCoursesByFaculty,
  createFreeCourse,
  updateFreeCourse,
  deleteFreeCourse,
  addSection,
  updateSection,
  deleteSection,
  addContentToSection,
  removeContentFromSection,
  getFreeCourseEnrollments,
} from '@/services/free-course-service'
import type {
  FreeCourse,
  CreateFreeCourseInput,
  UpdateFreeCourseInput,
  CreateSectionInput,
  UpdateSectionInput,
  CreateContentItemInput,
  FreeCourseQueryParams,
} from '@/types/api'

// Query keys
export const freeCourseKeys = {
  all: ['freeCourses'] as const,
  lists: () => [...freeCourseKeys.all, 'list'] as const,
  list: (filters?: FreeCourseQueryParams) =>
    [...freeCourseKeys.lists(), filters] as const,
  details: () => [...freeCourseKeys.all, 'detail'] as const,
  detail: (id: string) => [...freeCourseKeys.details(), id] as const,
  byUniversity: (universityId: string, filters?: FreeCourseQueryParams) =>
    [...freeCourseKeys.all, 'university', universityId, filters] as const,
  byFaculty: (
    universityId: string,
    facultyId: string,
    filters?: FreeCourseQueryParams
  ) => [...freeCourseKeys.all, 'faculty', universityId, facultyId, filters] as const,
  enrollments: (freeCourseId: string, filters?: FreeCourseQueryParams) =>
    [...freeCourseKeys.all, 'enrollments', freeCourseId, filters] as const,
}

// Query hooks
export const useFreeCourses = (params?: FreeCourseQueryParams) => {
  return useQuery({
    queryKey: freeCourseKeys.list(params),
    queryFn: () => getFreeCourses(params),
  })
}

export const useFreeCourse = (id: string) => {
  return useQuery({
    queryKey: freeCourseKeys.detail(id),
    queryFn: () => getFreeCourseById(id),
    enabled: !!id,
  })
}

export const useFreeCoursesByUniversity = (
  universityId: string,
  params?: FreeCourseQueryParams
) => {
  return useQuery({
    queryKey: freeCourseKeys.byUniversity(universityId, params),
    queryFn: () => getFreeCoursesByUniversity(universityId, params),
    enabled: !!universityId,
  })
}

export const useFreeCoursesByFaculty = (
  universityId: string,
  facultyId: string,
  params?: FreeCourseQueryParams
) => {
  return useQuery({
    queryKey: freeCourseKeys.byFaculty(universityId, facultyId, params),
    queryFn: () => getFreeCoursesByFaculty(universityId, facultyId, params),
    enabled: !!universityId && !!facultyId,
  })
}

export const useFreeCourseEnrollments = (
  freeCourseId: string,
  params?: FreeCourseQueryParams
) => {
  return useQuery({
    queryKey: freeCourseKeys.enrollments(freeCourseId, params),
    queryFn: () => getFreeCourseEnrollments(freeCourseId, params),
    enabled: !!freeCourseId,
  })
}

// Mutation hooks
export const useCreateFreeCourse = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateFreeCourseInput) => createFreeCourse(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: freeCourseKeys.lists() })
    },
  })
}

export const useUpdateFreeCourse = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateFreeCourseInput }) =>
      updateFreeCourse(id, data),
    onSuccess: (response, { id }) => {
      queryClient.invalidateQueries({ queryKey: freeCourseKeys.lists() })
      queryClient.invalidateQueries({ queryKey: freeCourseKeys.detail(id) })
    },
  })
}

export const useDeleteFreeCourse = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteFreeCourse(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: freeCourseKeys.lists() })
    },
  })
}

// Section mutation hooks
export const useAddSection = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ freeCourseId, data }: { freeCourseId: string; data: CreateSectionInput }) =>
      addSection(freeCourseId, data),
    onSuccess: (response, { freeCourseId }) => {
      queryClient.invalidateQueries({ queryKey: freeCourseKeys.detail(freeCourseId) })
      queryClient.invalidateQueries({ queryKey: freeCourseKeys.lists() })
    },
  })
}

export const useUpdateSection = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      freeCourseId,
      sectionId,
      data,
    }: {
      freeCourseId: string
      sectionId: string
      data: UpdateSectionInput
    }) => updateSection(freeCourseId, sectionId, data),
    onSuccess: (response, { freeCourseId }) => {
      queryClient.invalidateQueries({ queryKey: freeCourseKeys.detail(freeCourseId) })
      queryClient.invalidateQueries({ queryKey: freeCourseKeys.lists() })
    },
  })
}

export const useDeleteSection = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ freeCourseId, sectionId }: { freeCourseId: string; sectionId: string }) =>
      deleteSection(freeCourseId, sectionId),
    onSuccess: (response, { freeCourseId }) => {
      queryClient.invalidateQueries({ queryKey: freeCourseKeys.detail(freeCourseId) })
      queryClient.invalidateQueries({ queryKey: freeCourseKeys.lists() })
    },
  })
}

// Content mutation hooks
export const useAddContentToSection = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      freeCourseId,
      sectionId,
      data,
    }: {
      freeCourseId: string
      sectionId: string
      data: CreateContentItemInput
    }) => addContentToSection(freeCourseId, sectionId, data),
    onSuccess: (response, { freeCourseId }) => {
      queryClient.invalidateQueries({ queryKey: freeCourseKeys.detail(freeCourseId) })
      queryClient.invalidateQueries({ queryKey: freeCourseKeys.lists() })
    },
  })
}

export const useRemoveContentFromSection = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      freeCourseId,
      sectionId,
      contentId,
    }: {
      freeCourseId: string
      sectionId: string
      contentId: string
    }) => removeContentFromSection(freeCourseId, sectionId, contentId),
    onSuccess: (response, { freeCourseId }) => {
      queryClient.invalidateQueries({ queryKey: freeCourseKeys.detail(freeCourseId) })
      queryClient.invalidateQueries({ queryKey: freeCourseKeys.lists() })
    },
  })
}
