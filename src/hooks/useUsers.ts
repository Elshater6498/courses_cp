import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import * as userService from '../services/userService';
import type { PaginationParams, UpdateUserInput } from '../types/api';

// Query keys
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (params: PaginationParams) => [...userKeys.lists(), params] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
  stats: () => [...userKeys.all, 'stats'] as const,
  devices: (id: string) => [...userKeys.all, 'devices', id] as const,
};

// Get all users with pagination
export const useUsers = (params: PaginationParams = {}) => {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: () => userService.getUsers(params),
    placeholderData: keepPreviousData,
  });
};

// Get user by ID
export const useUser = (id: string) => {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => userService.getUserById(id),
    enabled: !!id,
  });
};

// Get user statistics
export const useUserStats = () => {
  return useQuery({
    queryKey: userKeys.stats(),
    queryFn: () => userService.getUserStats(),
  });
};

// Get user devices
export const useUserDevices = (id: string) => {
  return useQuery({
    queryKey: userKeys.devices(id),
    queryFn: () => userService.getUserDevices(id),
    enabled: !!id,
  });
};

// Search users
export const useSearchUsers = (params: PaginationParams = {}) => {
  return useQuery({
    queryKey: ['users', 'search', params],
    queryFn: () => userService.searchUsers(params),
    placeholderData: keepPreviousData,
    enabled: !!params.search,
  });
};

// Update user mutation
export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserInput }) => 
      userService.updateUser(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
};

// Delete user mutation
export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => userService.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
};

// Toggle user block mutation
export const useToggleUserBlock = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, blocked }: { id: string; blocked: boolean }) => 
      userService.toggleUserBlock(id, blocked),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
};

// Remove user device mutation
export const useRemoveUserDevice = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, deviceId }: { id: string; deviceId: string }) => 
      userService.removeUserDevice(id, deviceId),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: userKeys.devices(id) });
      queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
    },
  });
}; 