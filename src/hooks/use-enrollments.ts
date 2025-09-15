import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { enrollmentService } from '../services/enrollment-service'
import type {
  EnrollmentFilters,
  PaginationParams,
  RefundRequest
} from '../types/api'

export function useEnrollments(params: PaginationParams & EnrollmentFilters = {}) {
  const queryClient = useQueryClient()

  // Fetch enrollments
  const {
    data: enrollmentsData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['enrollments', params],
    queryFn: () => enrollmentService.getAllEnrollments(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Fetch enrollment statistics
  const {
    data: statsData,
    isLoading: isStatsLoading,
    error: statsError
  } = useQuery({
    queryKey: ['enrollment-stats', params.startDate, params.endDate],
    queryFn: () => enrollmentService.getEnrollmentStats(params.startDate, params.endDate),
    staleTime: 10 * 60 * 1000, // 10 minutes
  })

  // Refund enrollment mutation
  const refundMutation = useMutation({
    mutationFn: ({ enrollmentId, refundData }: { enrollmentId: string; refundData?: RefundRequest }) =>
      enrollmentService.adminRefundEnrollment(enrollmentId, refundData),
    onSuccess: (data) => {
      toast.success(data.message || 'Enrollment refunded successfully')
      queryClient.invalidateQueries({ queryKey: ['enrollments'] })
      queryClient.invalidateQueries({ queryKey: ['enrollment-stats'] })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to refund enrollment')
    }
  })

  // Cancel enrollment mutation
  const cancelMutation = useMutation({
    mutationFn: (enrollmentId: string) =>
      enrollmentService.adminCancelEnrollment(enrollmentId),
    onSuccess: (data) => {
      toast.success(data.message || 'Enrollment cancelled successfully')
      queryClient.invalidateQueries({ queryKey: ['enrollments'] })
      queryClient.invalidateQueries({ queryKey: ['enrollment-stats'] })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to cancel enrollment')
    }
  })

  // Helper functions
  const handleRefund = (enrollmentId: string, refundData?: RefundRequest) => {
    refundMutation.mutate({ enrollmentId, refundData })
  }

  const handleCancel = (enrollmentId: string) => {
    cancelMutation.mutate(enrollmentId)
  }

  const refreshEnrollments = () => {
    refetch()
  }

  return {
    // Data
    enrollments: enrollmentsData?.data?.enrollments || [],
    pagination: enrollmentsData?.data?.pagination,
    stats: statsData?.data,
    
    // Loading states
    isLoading,
    isStatsLoading,
    isRefunding: refundMutation.isPending,
    isCancelling: cancelMutation.isPending,
    
    // Error states
    error,
    statsError,
    
    // Actions
    handleRefund,
    handleCancel,
    refreshEnrollments,
    
    // Mutations for direct access if needed
    refundMutation,
    cancelMutation
  }
}

// Hook for enrollment statistics only
export function useEnrollmentStats(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ['enrollment-stats', startDate, endDate],
    queryFn: () => enrollmentService.getEnrollmentStats(startDate, endDate),
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}
