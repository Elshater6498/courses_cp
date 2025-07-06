import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { adminService } from '../services/adminService';
import type { PaginationParams, CreateAdminInput, UpdateAdminInput } from '../types/api';

// Query keys
export const adminKeys = {
  all: ['admins'] as const,
  lists: () => [...adminKeys.all, 'list'] as const,
  list: (params: PaginationParams) => [...adminKeys.lists(), params] as const,
  details: () => [...adminKeys.all, 'detail'] as const,
  detail: (id: string) => [...adminKeys.details(), id] as const,
  stats: () => [...adminKeys.all, 'stats'] as const,
  byRole: (roleId: string) => [...adminKeys.all, 'byRole', roleId] as const,
};

// Get all admins with pagination
export const useAdmins = (params: PaginationParams = {}) => {
  return useQuery({
    queryKey: adminKeys.list(params),
    queryFn: () => adminService.getAdmins(params),
    placeholderData: keepPreviousData,
  });
};

// Get admin by ID
export const useAdmin = (id: string) => {
  return useQuery({
    queryKey: adminKeys.detail(id),
    queryFn: () => adminService.getAdminById(id),
    enabled: !!id,
  });
};

// Get admin statistics
export const useAdminStats = () => {
  return useQuery({
    queryKey: adminKeys.stats(),
    queryFn: () => adminService.getAdminStats(),
  });
};

// Search admins
export const useSearchAdmins = (params: PaginationParams = {}) => {
  return useQuery({
    queryKey: ['admins', 'search', params],
    queryFn: () => adminService.searchAdmins(params),
    placeholderData: keepPreviousData,
    enabled: !!params.search, // Only search when there's a search term
  });
};

// Get admins by role
export const useAdminsByRole = (roleId: string, params: PaginationParams = {}) => {
  return useQuery({
    queryKey: adminKeys.byRole(roleId),
    queryFn: () => adminService.getAdminsByRole(roleId, params),
    enabled: !!roleId,
    placeholderData: keepPreviousData,
  });
};

// Create admin mutation
export const useCreateAdmin = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateAdminInput) => adminService.createAdmin(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.all });
    },
  });
};

// Update admin mutation
export const useUpdateAdmin = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAdminInput }) => 
      adminService.updateAdmin(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: adminKeys.all });
    },
  });
};

// Update admin password mutation
export const useUpdateAdminPassword = () => {
  return useMutation({
    mutationFn: ({ id, password }: { id: string; password: string }) => 
      adminService.updateAdminPassword(id, password),
  });
};

// Delete admin mutation
export const useDeleteAdmin = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => adminService.deleteAdmin(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.all });
    },
  });
};

// Hard delete admin mutation
export const useHardDeleteAdmin = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => adminService.hardDeleteAdmin(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.all });
    },
  });
}; 