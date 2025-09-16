import { apiGet, apiPost, apiPut, apiDelete } from './api';
import { UploadService, type UploadProgress } from './upload-service';
import type { 
  ApiResponse, 
  VideoLibrary,
  VideoLibraryResponse,
  CreateVideoLibraryInput,
  UpdateVideoLibraryInput,
  VideoLibraryQueryParams,
  VideoLibraryStats,
  VideoForSelect
} from '../types/api';

// Remove these interfaces as we'll use the UploadService instead

// Video Library API endpoints
const VIDEO_LIBRARY_ENDPOINTS = {
  VIDEO_LIBRARY: 'dashboard/video-library',
  VIDEO_LIBRARY_BY_ID: (id: string) => `dashboard/video-library/${id}`,
  PRESIGNED_VIDEO_URL: (id: string) => `dashboard/video-library/${id}/video-url`,
  VIDEO_STATS: (entityType: string) => `dashboard/video-library/stats/${entityType}`,
  SEARCH_VIDEOS: 'dashboard/video-library/search',
  VIDEOS_FOR_SELECT: 'dashboard/video-library/select',
  PERMANENT_DELETE: (id: string) => `dashboard/video-library/${id}/permanent`,
} as const;

// Video Library service functions
export const videoLibraryService = {

  // Create video library record after successful upload
  async createVideoLibrary(data: CreateVideoLibraryInput): Promise<ApiResponse<VideoLibrary>> {
    return apiPost<VideoLibrary>(VIDEO_LIBRARY_ENDPOINTS.VIDEO_LIBRARY, data);
  },

  // Get all video libraries with pagination and filters
  async getVideoLibraries(params?: VideoLibraryQueryParams): Promise<VideoLibraryResponse> {
    const response = await apiGet<VideoLibraryResponse['data']>(VIDEO_LIBRARY_ENDPOINTS.VIDEO_LIBRARY, { params });
    return {
      success: response.success,
      message: response.message,
      data: response.data!
    };
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
  ): Promise<VideoLibraryResponse> {
    const params = {
      search,
      ...filters,
      ...options,
      language,
    };
    const response = await apiGet<VideoLibraryResponse['data']>(VIDEO_LIBRARY_ENDPOINTS.SEARCH_VIDEOS, { params });
    return {
      success: response.success,
      message: response.message,
      data: response.data!
    };
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

  // Upload video with progress tracking using the standard UploadService
  async uploadVideoWithProgress(
    file: File,
    _entityType: 'lesson' | 'course',
    _entityId?: string,
    onProgress?: (progress: { loaded: number; total: number; percentage: number }) => void
  ): Promise<{ downloadUrl: string; key: string }> {
    try {
      // Use the standard UploadService for video uploads
      const uploadType = UploadService.getUploadType(file.type);
      const folder = `videos`;

      // Convert progress callback format to match UploadService
      const uploadProgressCallback = onProgress ? (progress: UploadProgress) => {
        onProgress({
          loaded: progress.uploadedBytes,
          total: progress.totalBytes,
          percentage: progress.percentage,
        });
      } : undefined;

      const result = await UploadService.uploadFileWithProgress(
        file,
        uploadType,
        folder,
        uploadProgressCallback
      );

      return {
        downloadUrl: result.downloadUrl,
        key: result.key,
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
