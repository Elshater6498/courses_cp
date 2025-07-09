import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import * as roleService from '../services/roleService';
import type { PaginationParams, CreateRoleInput, UpdateRoleInput } from '../types/api';

// Query keys
export const roleKeys = {
  all: ['roles'] as const,
  lists: () => [...roleKeys.all, 'list'] as const,
  list: (params: PaginationParams) => [...roleKeys.lists(), params] as const,
  details: () => [...roleKeys.all, 'detail'] as const,
  detail: (id: string) => [...roleKeys.details(), id] as const,
  stats: () => [...roleKeys.all, 'stats'] as const,
  allRoles: () => [...roleKeys.all, 'all'] as const,
  byPermission: (permissionId: string) => [...roleKeys.all, 'byPermission', permissionId] as const,
};

// Get all roles with pagination
export const useRoles = (params: PaginationParams = {}) => {
  return useQuery({
    queryKey: roleKeys.list(params),
    queryFn: () => roleService.getRoles(params),
    placeholderData: keepPreviousData,
  });
};

// Get all roles without pagination (for dropdowns)
export const useAllRoles = () => {
  return useQuery({
    queryKey: roleKeys.allRoles(),
    queryFn: () => roleService.getAllRoles(),
  });
};

// Get role by ID
export const useRole = (id: string) => {
  return useQuery({
    queryKey: roleKeys.detail(id),
    queryFn: () => roleService.getRoleById(id),
    enabled: !!id,
  });
};

// Get role statistics
export const useRoleStats = () => {
  return useQuery({
    queryKey: roleKeys.stats(),
    queryFn: () => roleService.getRoleStats(),
  });
};

// Search roles
export const useSearchRoles = (params: PaginationParams = {}) => {
  return useQuery({
    queryKey: ['roles', 'search', params],
    queryFn: () => roleService.searchRoles(params),
    placeholderData: keepPreviousData,
    enabled: !!params.search,
  });
};

// Get roles by permission
export const useRolesByPermission = (permissionId: string, params: PaginationParams = {}) => {
  return useQuery({
    queryKey: roleKeys.byPermission(permissionId),
    queryFn: () => roleService.getRolesByPermission(permissionId, params),
    enabled: !!permissionId,
    placeholderData: keepPreviousData,
  });
};

// Create role mutation
export const useCreateRole = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateRoleInput) => roleService.createRole(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roleKeys.all });
    },
  });
};

// Update role mutation
export const useUpdateRole = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRoleInput }) => 
      roleService.updateRole(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: roleKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: roleKeys.all });
    },
  });
};

// Delete role mutation
export const useDeleteRole = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => roleService.deleteRole(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roleKeys.all });
    },
  });
};

// Hard delete role mutation
export const useHardDeleteRole = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => roleService.hardDeleteRole(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roleKeys.all });
    },
  });
};

// Add permission to role mutation
export const useAddPermissionToRole = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ roleId, permissionId }: { roleId: string; permissionId: string }) => 
      roleService.addPermissionToRole(roleId, permissionId),
    onSuccess: (_, { roleId }) => {
      queryClient.invalidateQueries({ queryKey: roleKeys.detail(roleId) });
      queryClient.invalidateQueries({ queryKey: roleKeys.all });
    },
  });
};

// Remove permission from role mutation
export const useRemovePermissionFromRole = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ roleId, permissionId }: { roleId: string; permissionId: string }) => 
      roleService.removePermissionFromRole(roleId, permissionId),
    onSuccess: (_, { roleId }) => {
      queryClient.invalidateQueries({ queryKey: roleKeys.detail(roleId) });
      queryClient.invalidateQueries({ queryKey: roleKeys.all });
    },
  });
}; 