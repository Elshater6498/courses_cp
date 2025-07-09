// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: {
    items: T[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
      hasNext: boolean;
      hasPrev: boolean;
      nextPage: number | null;
      prevPage: number | null;
    };
    meta?: {
      search?: string;
      filter?: Record<string, any>;
    };
  };
}

// Pagination Parameters
export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  isActive?: boolean;
  [key: string]: any;
}

// Auth Types
export interface LoginCredentials {
  email?: string;
  userName?: string;
  password: string;
}

export interface AuthResponse {
  admin: Admin;
  token: string;
}

// Admin Types
export interface Admin {
  _id: string;
  userName: string;
  email: string;
  phone?: string;
  roleId: Role;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAdminInput {
  userName: string;
  email: string;
  password: string;
  roleId: string;
  phone?: string;
}

export interface UpdateAdminInput {
  userName?: string;
  email?: string;
  phone?: string;
  isActive?: boolean;
  roleId?: string;
}

// Role Types
export interface Role {
  _id: string;
  name: string;
  permissions: Permission[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateRoleInput {
  name: string;
  permissions: string[];
}

export interface UpdateRoleInput {
  name?: string;
  permissions?: string[];
  isActive?: boolean;
}

// Permission Types
export interface Permission {
  _id: string;
  name: string;
  resource: string;
  action: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type CreatePermissionInput = Pick<Permission, 'name' | 'resource' | 'action' | 'description'>;
export type UpdatePermissionInput = Partial<Pick<Permission, 'name' | 'resource' | 'action' | 'description' | 'isActive'>>;

export type PermissionResource = 
  | 'admin'
  | 'roles'
  | 'permissions'
  | 'users'
  | 'faculties'
  | 'universities'
  | 'courses'
  | 'enrollments'
  | 'lessons'
  | 'topics';

export type PermissionAction = 
  | 'create'
  | 'read' 
  | 'update'
  | 'delete'
  | 'export'
  | 'import';

// University Types
export interface University {
  _id: string;
  name: string;
  code: string;
  country: string;
  city: string;
  website?: string;
  description?: string;
  logo?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Faculty Types
export interface Faculty {
  _id: string;
  name: string;
  code: string;
  universityId: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// User Types
export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other';
  universityId?: string;
  facultyId?: string;
  isActive: boolean;
  isEmailVerified: boolean;
  devices: Device[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Device {
  deviceId: string;
  deviceName: string;
  deviceType: string;
  isActive: boolean;
  lastUsed: Date;
}

// Course Types
export interface Course {
  _id: string;
  title: string;
  description: string;
  facultyId: string;
  instructorId: string;
  duration: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Error Types
export interface ValidationError {
  field: string;
  message: string;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: ValidationError[];
  error?: string;
} 