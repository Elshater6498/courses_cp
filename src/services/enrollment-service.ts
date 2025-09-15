import { apiGet, apiPost, apiDelete } from './api'
import type {
  ApiResponse,
  Enrollment,
  EnrollmentStats,
  EnrollmentFilters,
  RefundRequest,
  PaginationParams
} from '../types/api'

export class EnrollmentService {
  private baseUrl = '/dashboard/enrollments'

  /**
   * Get all enrollments with pagination and filtering (admin only)
   */
  async getAllEnrollments(
    params: PaginationParams & EnrollmentFilters = {}
  ): Promise<ApiResponse<{ enrollments: Enrollment[]; pagination: any }>> {
    const searchParams = new URLSearchParams()
    
    // Add pagination params
    if (params.page) searchParams.append('page', params.page.toString())
    if (params.limit) searchParams.append('limit', params.limit.toString())
    if (params.search) searchParams.append('search', params.search)
    if (params.sort) searchParams.append('sort', params.sort)
    
    // Add filter params
    if (params.status) searchParams.append('status', params.status === 'all' ? "" : params.status)
    if (params.isActive !== undefined) searchParams.append('isActive', params.isActive.toString() === 'all' ? "" : params.isActive.toString())
    if (params.fullAccess !== undefined) searchParams.append('fullAccess', params.fullAccess.toString() === 'all' ? "" : params.fullAccess.toString())
    if (params.courseId) searchParams.append('courseId', params.courseId)
    if (params.userId) searchParams.append('userId', params.userId)
    if (params.startDate) searchParams.append('startDate', params.startDate)
    if (params.endDate) searchParams.append('endDate', params.endDate)

    return await apiGet<{ enrollments: Enrollment[]; pagination: any }>(`${this.baseUrl}/all?${searchParams.toString()}`)
  }

  /**
   * Get enrollment statistics (admin only)
   */
  async getEnrollmentStats(
    startDate?: string,
    endDate?: string
  ): Promise<ApiResponse<EnrollmentStats>> {
    const searchParams = new URLSearchParams()
    if (startDate) searchParams.append('startDate', startDate)
    if (endDate) searchParams.append('endDate', endDate)

    return await apiGet<EnrollmentStats>(`${this.baseUrl}/stats?${searchParams.toString()}`)
  }

  /**
   * Admin refund enrollment (admin only)
   */
  async adminRefundEnrollment(
    enrollmentId: string,
    refundData?: RefundRequest
  ): Promise<ApiResponse<Enrollment>> {
    return await apiPost<Enrollment>(
      `${this.baseUrl}/${enrollmentId}/admin-refund`,
      refundData
    )
  }

  /**
   * Admin cancel enrollment (admin only)
   */
  async adminCancelEnrollment(enrollmentId: string): Promise<ApiResponse<Enrollment>> {
    return await apiDelete<Enrollment>(`${this.baseUrl}/${enrollmentId}/admin-cancel`)
  }
}

export const enrollmentService = new EnrollmentService()
