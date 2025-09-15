import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { attachedFilesService, type CreateAttachedFileInput, type UpdateAttachedFileInput } from "@/services/attached-files-service";

// Hook to get attached files by entity
export function useAttachedFiles(
  entityType: "course" | "topic" | "lesson",
  entityId: string,
  includePresignedUrls: boolean = true
) {
  return useQuery({
    queryKey: ["attached-files", entityType, entityId],
    queryFn: () => attachedFilesService.getAttachedFilesByEntity(entityType, entityId, includePresignedUrls),
    enabled: !!entityId,
  });
}

// Hook to get a single attached file by ID
export function useAttachedFile(
  fileId: string,
  includePresignedUrl: boolean = true
) {
  return useQuery({
    queryKey: ["attached-file", fileId],
    queryFn: () => attachedFilesService.getAttachedFileById(fileId, includePresignedUrl),
    enabled: !!fileId,
  });
}

// Hook to get file statistics for an entity
export function useEntityFileStats(
  entityType: "course" | "topic" | "lesson",
  entityId: string
) {
  return useQuery({
    queryKey: ["attached-files-stats", entityType, entityId],
    queryFn: () => attachedFilesService.getEntityFileStats(entityType, entityId),
    enabled: !!entityId,
  });
}

// Hook to create an attached file
export function useCreateAttachedFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAttachedFileInput) => attachedFilesService.createAttachedFile(data),
    onSuccess: (_, variables) => {
      // Invalidate the attached files query for the specific entity
      queryClient.invalidateQueries({ 
        queryKey: ["attached-files", variables.entityType, variables.entityId] 
      });
      // Also invalidate stats
      queryClient.invalidateQueries({ 
        queryKey: ["attached-files-stats", variables.entityType, variables.entityId] 
      });
      toast.success("File attached successfully!");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to attach file");
    },
  });
}

// Hook to update an attached file
export function useUpdateAttachedFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAttachedFileInput }) => 
      attachedFilesService.updateAttachedFile(id, data),
    onSuccess: (response) => {
      const file = response.data;
      if (file) {
        // Invalidate the specific file query
        queryClient.invalidateQueries({ queryKey: ["attached-file", file._id] });
        // Invalidate the attached files query for the entity
        queryClient.invalidateQueries({ 
          queryKey: ["attached-files", file.entityType, file.entityId] 
        });
      }
      toast.success("File updated successfully!");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to update file");
    },
  });
}

// Hook to delete an attached file
export function useDeleteAttachedFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (fileId: string) => attachedFilesService.deleteAttachedFile(fileId),
    onSuccess: (_, fileId) => {
      // Invalidate all attached files queries since we don't know which entity this file belonged to
      queryClient.invalidateQueries({ queryKey: ["attached-files"] });
      queryClient.invalidateQueries({ queryKey: ["attached-files-stats"] });
      queryClient.invalidateQueries({ queryKey: ["attached-file", fileId] });
      toast.success("File deleted successfully!");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to delete file");
    },
  });
}

// Hook to get presigned download URL
export function usePresignedDownloadUrl() {
  return useMutation({
    mutationFn: ({ fileId, expiresIn }: { fileId: string; expiresIn?: number }) => 
      attachedFilesService.getPresignedDownloadUrl(fileId, expiresIn),
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to generate download URL");
    },
  });
}
