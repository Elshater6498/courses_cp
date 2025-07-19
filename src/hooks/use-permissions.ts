import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import * as permissionService from '../services/permission-service';
import type { PaginationParams, CreatePermissionInput, UpdatePermissionInput } from '../types/api';

// Query keys
export const permissionKeys = {
  all: ['permissions'] as const,
  lists: () => [...permissionKeys.all, 'list'] as const,
  list: (params: PaginationParams) => [...permissionKeys.lists(), params] as const,
  details: () => [...permissionKeys.all, 'detail'] as const,
  detail: (id: string) => [...permissionKeys.details(), id] as const,
  stats: () => [...permissionKeys.all, 'stats'] as const,
  allPermissions: () => [...permissionKeys.all, 'all'] as const,
};

// Get all permissions with pagination
export const usePermissions = (params: PaginationParams = {}) => {
  return useQuery({
    queryKey: permissionKeys.list(params),
    queryFn: () => permissionService.getPermissions(params),
    placeholderData: keepPreviousData,
  });
};

// Get all permissions without pagination (for dropdowns)
export const useAllPermissions = () => {
  return useQuery({
    queryKey: permissionKeys.allPermissions(),
    queryFn: () => permissionService.getAllPermissions(),
  });
};

// Get permission by ID
export const usePermission = (id: string) => {
  return useQuery({
    queryKey: permissionKeys.detail(id),
    queryFn: () => permissionService.getPermissionById(id),
    enabled: !!id,
  });
};

// Get permission statistics
export const usePermissionStats = () => {
  return useQuery({
    queryKey: permissionKeys.stats(),
    queryFn: () => permissionService.getPermissionStats(),
  });
};

// Search permissions
export const useSearchPermissions = (params: PaginationParams = {}) => {
  return useQuery({
    queryKey: ['permissions', 'search', params],
    queryFn: () => permissionService.searchPermissions(params),
    placeholderData: keepPreviousData,
    enabled: !!params.search,
  });
};

// Create permission mutation
export const useCreatePermission = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreatePermissionInput) => permissionService.createPermission(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: permissionKeys.all });
    },
  });
};

// Update permission mutation
export const useUpdatePermission = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePermissionInput }) => 
      permissionService.updatePermission(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: permissionKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: permissionKeys.all });
    },
  });
};

// Delete permission mutation
export const useDeletePermission = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => permissionService.deletePermission(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: permissionKeys.all });
    },
  });
}; 