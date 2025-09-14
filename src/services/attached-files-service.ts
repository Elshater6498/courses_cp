import { apiGet, apiPost, apiPut, apiDelete, apiGetPaginated } from './api';
import type { 
  ApiResponse, 
  PaginatedResponse, 
  PaginationParams 
} from '../types/api';

// Types for Attached Files
export interface AttachedFile {
  _id: string;
  name: {
    en: string;
    ar?: string;
    he?: string;
  };
  fileUrl: string;
  fileType: string;
  entityType: 'lesson' | 'topic' | 'course';
  entityId: string;
  uploadedBy: {
    _id: string;
    userName: string;
    email: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // Virtual fields
  fileExtension?: string;
  isImage?: boolean;
  isVideo?: boolean;
  isDocument?: boolean;
  presignedDownloadUrl?: string;
}

export interface CreateAttachedFileInput {
  name: {
    en: string;
    ar?: string;
    he?: string;
  };
  fileUrl: string;
  fileType: string;
  entityType: 'lesson' | 'topic' | 'course';
  entityId: string;
}

export interface UpdateAttachedFileInput {
  name?: {
    en?: string;
    ar?: string;
    he?: string;
  };
}

export interface AttachedFileQueryParams extends PaginationParams {
  entityType?: 'lesson' | 'topic' | 'course';
  entityId?: string;
  fileType?: string;
  uploadedBy?: string;
  isActive?: boolean;
  search?: string;
  includePresignedUrls?: boolean;
}

export interface AttachedFileStats {
  totalFiles: number;
  imageCount: number;
  videoCount: number;
  documentCount: number;
  audioCount: number;
  otherCount: number;
}

// Attached Files API endpoints
const ATTACHED_FILES_ENDPOINTS = {
  ATTACHED_FILES: 'dashboard/attached-files',
  ATTACHED_FILE_BY_ID: (id: string) => `dashboard/attached-files/${id}`,
  ATTACHED_FILES_BY_ENTITY: (entityType: string, entityId: string) => 
    `dashboard/attached-files/entity/${entityType}/${entityId}`,
  PRESIGNED_DOWNLOAD_URL: (id: string) => `dashboard/attached-files/${id}/download`,
  PERMANENT_DELETE: (id: string) => `dashboard/attached-files/${id}/permanent`,
  ENTITY_FILE_STATS: (entityType: string, entityId: string) => 
    `dashboard/attached-files/entity/${entityType}/${entityId}/stats`,
  SEARCH_ATTACHED_FILES: 'dashboard/attached-files/search',
} as const;

// Attached Files service functions
export const attachedFilesService = {
  // Create attached file record after successful upload
  async createAttachedFile(data: CreateAttachedFileInput): Promise<ApiResponse<AttachedFile>> {
    return apiPost<AttachedFile>(ATTACHED_FILES_ENDPOINTS.ATTACHED_FILES, data);
  },

  // Get all attached files with pagination and filters
  async getAttachedFiles(params?: AttachedFileQueryParams): Promise<PaginatedResponse<AttachedFile>> {
    return apiGetPaginated<AttachedFile>(ATTACHED_FILES_ENDPOINTS.ATTACHED_FILES, params);
  },

  // Get attached file by ID
  async getAttachedFileById(
    id: string, 
    includePresignedUrl: boolean = true
  ): Promise<ApiResponse<AttachedFile>> {
    const params = includePresignedUrl ? { includePresignedUrl: 'true' } : {};
    return apiGet<AttachedFile>(ATTACHED_FILES_ENDPOINTS.ATTACHED_FILE_BY_ID(id), { params });
  },

  // Get attached files by entity (lesson, topic, or course)
  async getAttachedFilesByEntity(
    entityType: 'lesson' | 'topic' | 'course',
    entityId: string,
    includePresignedUrls: boolean = true
  ): Promise<ApiResponse<AttachedFile[]>> {
    const params = includePresignedUrls ? { includePresignedUrls: 'true' } : {};
    return apiGet<AttachedFile[]>(
      ATTACHED_FILES_ENDPOINTS.ATTACHED_FILES_BY_ENTITY(entityType, entityId),
      { params }
    );
  },

  // Get presigned download URL for a file
  async getPresignedDownloadUrl(
    id: string, 
    expiresIn?: number
  ): Promise<ApiResponse<{ downloadUrl: string; expiresIn: number }>> {
    const params = expiresIn ? { expiresIn: expiresIn.toString() } : {};
    return apiGet<{ downloadUrl: string; expiresIn: number }>(
      ATTACHED_FILES_ENDPOINTS.PRESIGNED_DOWNLOAD_URL(id),
      { params }
    );
  },

  // Update attached file
  async updateAttachedFile(
    id: string, 
    data: UpdateAttachedFileInput
  ): Promise<ApiResponse<AttachedFile>> {
    return apiPut<AttachedFile>(ATTACHED_FILES_ENDPOINTS.ATTACHED_FILE_BY_ID(id), data);
  },

  // Permanently delete attached file (remove from database and S3)
  async deleteAttachedFile(id: string): Promise<ApiResponse<void>> {
    return apiDelete<void>(ATTACHED_FILES_ENDPOINTS.PERMANENT_DELETE(id));
  },

  // Get file statistics for an entity
  async getEntityFileStats(
    entityType: 'lesson' | 'topic' | 'course',
    entityId: string
  ): Promise<ApiResponse<AttachedFileStats>> {
    return apiGet<AttachedFileStats>(
      ATTACHED_FILES_ENDPOINTS.ENTITY_FILE_STATS(entityType, entityId)
    );
  },

  // Search attached files
  async searchAttachedFiles(
    searchTerm: string,
    filters: {
      entityType?: 'lesson' | 'topic' | 'course';
      fileType?: string;
      uploadedBy?: string;
    } = {},
    options: { page?: number; limit?: number } = {}
  ): Promise<PaginatedResponse<AttachedFile>> {
    const params = {
      search: searchTerm,
      ...filters,
      ...options,
    };
    return apiGetPaginated<AttachedFile>(ATTACHED_FILES_ENDPOINTS.SEARCH_ATTACHED_FILES, params);
  },
};
