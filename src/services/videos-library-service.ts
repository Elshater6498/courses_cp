import { apiGet, apiPost, apiPut, apiDelete, apiGetPaginated } from './api';
import type { 
  ApiResponse, 
  PaginatedResponse, 
  PaginationParams 
} from '../types/api';

// Types for Video Library
export interface VideoLibrary {
  _id: string;
  name: {
    en: string;
    ar?: string;
    he?: string;
  };
  videoUrl: string;
  videoType: string;
  fileSize?: number;
  entityType: 'lesson' | 'course';
  uploadedBy: {
    _id: string;
    userName: string;
    email: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // Virtual fields
  videoExtension?: string;
  formattedFileSize?: string;
  presignedVideoUrl?: string;
}

export interface CreateVideoLibraryInput {
  name: {
    en: string;
    ar?: string;
    he?: string;
  };
  videoUrl: string;
  videoType: string;
  fileSize?: number;
  entityType: 'lesson' | 'course';
  uploadedBy?: string;
}

export interface UpdateVideoLibraryInput {
  name?: {
    en?: string;
    ar?: string;
    he?: string;
  };
  isActive?: boolean;
}

export interface VideoLibraryQueryParams extends PaginationParams {
  entityType?: 'lesson' | 'course';
  videoType?: string;
  uploadedBy?: string;
  isActive?: boolean;
  search?: string;
  fileSizeMin?: number;
  fileSizeMax?: number;
  language?: 'en' | 'ar' | 'he' | 'all';
  includePresignedUrls?: boolean;
}

export interface VideoLibraryStats {
  totalVideos: number;
  totalFileSize: number;
  averageFileSize: number;
  videoTypes: { [key: string]: number };
}

export interface VideoForSelect {
  id: string;
  name: string;
  videoUrl: string;
}

export interface GenerateUploadUrlRequest {
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadType: 'video';
  entityType?: 'lesson' | 'course';
  entityId?: string;
}

export interface GenerateUploadUrlResponse {
  presignedUrl: string;
  downloadUrl: string;
  key: string;
}

// Video Library API endpoints
const VIDEO_LIBRARY_ENDPOINTS = {
  VIDEO_LIBRARY: 'dashboard/video-library',
  VIDEO_LIBRARY_BY_ID: (id: string) => `dashboard/video-library/${id}`,
  GENERATE_UPLOAD_URL: 'dashboard/video-library/upload-url',
  PRESIGNED_VIDEO_URL: (id: string) => `dashboard/video-library/${id}/video-url`,
  VIDEO_STATS: (entityType: string) => `dashboard/video-library/stats/${entityType}`,
  SEARCH_VIDEOS: 'dashboard/video-library/search',
  VIDEOS_FOR_SELECT: 'dashboard/video-library/select',
  PERMANENT_DELETE: (id: string) => `dashboard/video-library/${id}/permanent`,
} as const;

// Video Library service functions
export const videoLibraryService = {
  // Generate presigned URL for video upload
  async generateUploadUrl(data: GenerateUploadUrlRequest): Promise<ApiResponse<GenerateUploadUrlResponse>> {
    return apiPost<GenerateUploadUrlResponse>(VIDEO_LIBRARY_ENDPOINTS.GENERATE_UPLOAD_URL, data);
  },

  // Create video library record after successful upload
  async createVideoLibrary(data: CreateVideoLibraryInput): Promise<ApiResponse<VideoLibrary>> {
    return apiPost<VideoLibrary>(VIDEO_LIBRARY_ENDPOINTS.VIDEO_LIBRARY, data);
  },

  // Get all video libraries with pagination and filters
  async getVideoLibraries(params?: VideoLibraryQueryParams): Promise<PaginatedResponse<VideoLibrary>> {
    return apiGetPaginated<VideoLibrary>(VIDEO_LIBRARY_ENDPOINTS.VIDEO_LIBRARY, params);
  },

  // Get video library by ID
  async getVideoLibraryById(
    id: string,
    params: {
      language?: 'en' | 'ar' | 'he' | 'all';
      includePresignedUrls?: boolean;
    } = {}
  ): Promise<ApiResponse<VideoLibrary>> {
    const queryParams: Record<string, string> = {};
    if (params.language) {
      queryParams.language = params.language;
    }
    if (params.includePresignedUrls) {
      queryParams.includePresignedUrls = 'true';
    }
    return apiGet<VideoLibrary>(VIDEO_LIBRARY_ENDPOINTS.VIDEO_LIBRARY_BY_ID(id), { params: queryParams });
  },

  // Get presigned video URL for a video
  async getPresignedVideoUrl(
    id: string,
    expiresIn?: number
  ): Promise<ApiResponse<{ videoUrl: string; expiresIn: number }>> {
    const params = expiresIn ? { expiresIn: expiresIn.toString() } : {};
    return apiGet<{ videoUrl: string; expiresIn: number }>(
      VIDEO_LIBRARY_ENDPOINTS.PRESIGNED_VIDEO_URL(id),
      { params }
    );
  },

  // Update video library
  async updateVideoLibrary(
    id: string,
    data: UpdateVideoLibraryInput,
    params: { language?: 'en' | 'ar' | 'he' | 'all' } = {}
  ): Promise<ApiResponse<VideoLibrary>> {
    const queryParams: Record<string, string> = {};
    if (params.language) {
      queryParams.language = params.language;
    }
    return apiPut<VideoLibrary>(VIDEO_LIBRARY_ENDPOINTS.VIDEO_LIBRARY_BY_ID(id), data, { params: queryParams });
  },

  // Soft delete video library (mark as inactive)
  async softDeleteVideoLibrary(
    id: string,
    params: { language?: 'en' | 'ar' | 'he' | 'all' } = {}
  ): Promise<ApiResponse<VideoLibrary>> {
    const queryParams: Record<string, string> = {};
    if (params.language) {
      queryParams.language = params.language;
    }
    return apiDelete<VideoLibrary>(VIDEO_LIBRARY_ENDPOINTS.VIDEO_LIBRARY_BY_ID(id), { params: queryParams });
  },

  // Hard delete video library (permanently delete)
  async hardDeleteVideoLibrary(id: string): Promise<ApiResponse<void>> {
    return apiDelete<void>(VIDEO_LIBRARY_ENDPOINTS.PERMANENT_DELETE(id));
  },

  // Get video statistics for an entity type
  async getEntityVideoStats(entityType: 'lesson' | 'course'): Promise<ApiResponse<VideoLibraryStats>> {
    return apiGet<VideoLibraryStats>(VIDEO_LIBRARY_ENDPOINTS.VIDEO_STATS(entityType));
  },

  // Search video libraries
  async searchVideoLibraries(
    search: string,
    filters: {
      entityType?: 'lesson' | 'course';
      videoType?: string;
      uploadedBy?: string;
    } = {},
    options: { page?: number; limit?: number } = {},
    language: 'en' | 'ar' | 'he' | 'all' = 'en'
  ): Promise<PaginatedResponse<VideoLibrary>> {
    const params = {
      search,
      ...filters,
      ...options,
      language,
    };
    return apiGetPaginated<VideoLibrary>(VIDEO_LIBRARY_ENDPOINTS.SEARCH_VIDEOS, params);
  },

  // Get videos for select input (id, name, videoUrl only)
  async getVideosForSelect(
    entityType: 'lesson' | 'course',
    language: 'en' | 'ar' | 'he' | 'all' = 'en'
  ): Promise<ApiResponse<VideoForSelect[]>> {
    const params = {
      entityType,
      language,
    };
    return apiGet<VideoForSelect[]>(VIDEO_LIBRARY_ENDPOINTS.VIDEOS_FOR_SELECT, { params });
  },

  // Upload video with progress tracking
  async uploadVideoWithProgress(
    file: File,
    entityType: 'lesson' | 'course',
    entityId?: string,
    _onProgress?: (progress: { loaded: number; total: number; percentage: number }) => void
  ): Promise<{ downloadUrl: string; key: string }> {
    try {
      // Generate upload URL
      const uploadUrlResponse = await this.generateUploadUrl({
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        uploadType: 'video',
        entityType,
        entityId,
      });

      const uploadUrlData = uploadUrlResponse.data!;

      // Upload file to S3
      const uploadResponse = await fetch(uploadUrlData.presignedUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file to S3');
      }

      return {
        downloadUrl: uploadUrlData.downloadUrl,
        key: uploadUrlData.key,
      };
    } catch (error) {
      console.error('Error uploading video:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Failed to upload video'
      );
    }
  },

  // Format file size in bytes to human readable format
  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  // Get video extension from filename
  getVideoExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || '';
  },

  // Validate video file type
  isValidVideoFile(file: File): boolean {
    const validTypes = [
      'video/mp4',
      'video/mpeg',
      'video/mov',
      'video/avi',
      'video/webm',
      'video/ogg',
      'video/quicktime',
    ];
    
    return validTypes.includes(file.type);
  },

  // Get video duration (requires video element)
  async getVideoDuration(file: File): Promise<number> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        resolve(video.duration);
      };
      
      video.onerror = () => {
        window.URL.revokeObjectURL(video.src);
        reject(new Error('Failed to load video metadata'));
      };
      
      video.src = URL.createObjectURL(file);
    });
  },
};
