import {
  apiGet,
  apiPost,
  apiPut,
  apiDelete,
  apiGetPaginated,
} from './api'
import type {
  FreeCourse,
  CreateFreeCourseInput,
  UpdateFreeCourseInput,
  CreateSectionInput,
  UpdateSectionInput,
  CreateContentItemInput,
  FreeCourseQueryParams,
  ApiResponse,
  PaginatedResponse,
} from '@/types/api'

// Free Course CRUD operations
export const getFreeCourses = async (
  params?: FreeCourseQueryParams
): Promise<PaginatedResponse<FreeCourse>> => {
  return apiGetPaginated<FreeCourse>('/dashboard/freecourses/admin/all', params)
}

export const getFreeCourseById = async (id: string): Promise<ApiResponse<FreeCourse>> => {
  return apiGet<FreeCourse>(`/dashboard/freecourses/${id}`)
}

export const getFreeCoursesByUniversity = async (
  universityId: string,
  params?: FreeCourseQueryParams
): Promise<PaginatedResponse<FreeCourse>> => {
  return apiGetPaginated<FreeCourse>(
    `/dashboard/freecourses/university/${universityId}`,
    params
  )
}

export const getFreeCoursesByFaculty = async (
  universityId: string,
  facultyId: string,
  params?: FreeCourseQueryParams
): Promise<PaginatedResponse<FreeCourse>> => {
  return apiGetPaginated<FreeCourse>(
    `/dashboard/freecourses/faculty/${universityId}/${facultyId}`,
    params
  )
}

export const createFreeCourse = async (
  data: CreateFreeCourseInput
): Promise<ApiResponse<FreeCourse>> => {
  return apiPost<FreeCourse>('/dashboard/freecourses', data)
}

export const updateFreeCourse = async (
  id: string,
  data: UpdateFreeCourseInput
): Promise<ApiResponse<FreeCourse>> => {
  return apiPut<FreeCourse>(`/dashboard/freecourses/${id}`, data)
}

export const deleteFreeCourse = async (id: string): Promise<ApiResponse<FreeCourse>> => {
  return apiDelete<FreeCourse>(`/dashboard/freecourses/${id}`)
}

// Section management
export const addSection = async (
  freeCourseId: string,
  data: CreateSectionInput
): Promise<ApiResponse<FreeCourse>> => {
  return apiPost<FreeCourse>(`/dashboard/freecourses/${freeCourseId}/sections`, data)
}

export const updateSection = async (
  freeCourseId: string,
  sectionId: string,
  data: UpdateSectionInput
): Promise<ApiResponse<FreeCourse>> => {
  return apiPut<FreeCourse>(
    `/dashboard/freecourses/${freeCourseId}/sections/${sectionId}`,
    data
  )
}

export const deleteSection = async (
  freeCourseId: string,
  sectionId: string
): Promise<ApiResponse<FreeCourse>> => {
  return apiDelete<FreeCourse>(
    `/dashboard/freecourses/${freeCourseId}/sections/${sectionId}`
  )
}

// Content management
export const addContentToSection = async (
  freeCourseId: string,
  sectionId: string,
  data: CreateContentItemInput
): Promise<ApiResponse<FreeCourse>> => {
  return apiPost<FreeCourse>(
    `/dashboard/freecourses/${freeCourseId}/sections/${sectionId}/content`,
    data
  )
}

export const removeContentFromSection = async (
  freeCourseId: string,
  sectionId: string,
  contentId: string
): Promise<ApiResponse<FreeCourse>> => {
  return apiDelete<FreeCourse>(
    `/dashboard/freecourses/${freeCourseId}/sections/${sectionId}/content/${contentId}`
  )
}

// Enrollments
export const getFreeCourseEnrollments = async (
  freeCourseId: string,
  params?: FreeCourseQueryParams
): Promise<PaginatedResponse<any>> => {
  return apiGetPaginated<any>(
    `/dashboard/freecourses/${freeCourseId}/enrollments`,
    params
  )
}
