import { apiPost } from './api';

export interface PresignedUrlRequest {
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadType: 'image' | 'video';
  folder?: string;
}

export interface PresignedUrlResponse {
  uploadUrl: string;
  downloadUrl: string;
  key: string;
  expires: number;
}

export interface UploadProgress {
  percentage: number;
  uploadedBytes: number;
  totalBytes: number;
  startTime: number;
  estimatedTimeRemaining: number;
  speed: number; // bytes per second
}

export interface UploadResult {
  downloadUrl: string;
  key: string;
  fileName: string;
}

export class UploadService {
  /**
   * Request a presigned URL for file upload
   */
  static async getPresignedUrl(request: PresignedUrlRequest): Promise<PresignedUrlResponse> {
    const response = await apiPost<PresignedUrlResponse>('/dashboard/upload/presigned-url', request);
    return response.data!;
  }

  /**
   * Upload file to S3 using presigned URL with progress tracking
   */
  static async uploadFile(
    file: File,
    presignedUrl: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResult> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const startTime = Date.now();
      let lastProgressTime = startTime;
      let lastUploadedBytes = 0;

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const currentTime = Date.now();
          const uploadedBytes = event.loaded;
          const totalBytes = event.total;
          const percentage = Math.round((uploadedBytes / totalBytes) * 100);

          // Calculate speed (bytes per second)
          const timeDiff = (currentTime - lastProgressTime) / 1000; // seconds
          const bytesDiff = uploadedBytes - lastUploadedBytes;
          const speed = timeDiff > 0 ? bytesDiff / timeDiff : 0;

          // Calculate estimated time remaining
          const remainingBytes = totalBytes - uploadedBytes;
          const estimatedTimeRemaining = speed > 0 ? remainingBytes / speed : 0;

          const progress: UploadProgress = {
            percentage,
            uploadedBytes,
            totalBytes,
            startTime,
            estimatedTimeRemaining,
            speed,
          };

          onProgress?.(progress);
          lastProgressTime = currentTime;
          lastUploadedBytes = uploadedBytes;
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          // Extract the download URL from the presigned URL
          const url = new URL(presignedUrl);
          const key = url.searchParams.get('key') || '';
          const downloadUrl = presignedUrl.split('?')[0]; // Remove query parameters

          resolve({
            downloadUrl,
            key,
            fileName: file.name,
          });
        } else {
          reject(new Error(`Upload failed with status: ${xhr.status}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed due to network error'));
      });

      xhr.addEventListener('abort', () => {
        reject(new Error('Upload was aborted'));
      });

      xhr.open('PUT', presignedUrl);
      xhr.setRequestHeader('Content-Type', file.type);
      xhr.send(file);
    });
  }

  /**
   * Upload file with full workflow (get presigned URL + upload)
   */
  static async uploadFileWithProgress(
    file: File,
    uploadType: 'image' | 'video',
    folder?: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResult> {
    // Step 1: Get presigned URL
    const presignedUrlRequest: PresignedUrlRequest = {
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      uploadType,
      folder,
    };

    const presignedUrlResponse = await this.getPresignedUrl(presignedUrlRequest);
    console.log("presignedUrlResponse", presignedUrlResponse);
    // Step 2: Upload file with progress tracking
    const result = await this.uploadFile(file, presignedUrlResponse.uploadUrl, onProgress);

    return {
      ...result,
      downloadUrl: presignedUrlResponse.downloadUrl,
      key: presignedUrlResponse.key,
    };
  }

  /**
   * Format bytes to human readable string
   */
  static formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Format time in seconds to human readable string
   */
  static formatTime(seconds: number): string {
    if (seconds < 60) {
      return `${Math.round(seconds)}s`;
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = Math.round(seconds % 60);
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return `${hours}h ${minutes}m`;
    }
  }
} 