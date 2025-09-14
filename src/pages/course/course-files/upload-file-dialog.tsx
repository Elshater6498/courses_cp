import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Upload, X, Image, Video, Music, File } from "lucide-react";
import { toast } from "sonner";
import { UploadService, type UploadProgress } from "@/services/upload-service";
import { UploadProgressCard } from "@/components/ui/upload-progress";
import { useCreateAttachedFile } from "@/hooks/use-attached-files";
import { type CreateAttachedFileInput } from "@/services/attached-files-service";

// Form schema
const uploadFileSchema = z.object({
  name: z.object({
    en: z
      .string()
      .min(1, "English name is required")
      .max(255, "English name cannot exceed 255 characters"),
    ar: z
      .string()
      .max(255, "Arabic name cannot exceed 255 characters")
      .optional()
      .or(z.literal("")),
    he: z
      .string()
      .max(255, "Hebrew name cannot exceed 255 characters")
      .optional()
      .or(z.literal("")),
  }),
});

type UploadFileFormData = z.infer<typeof uploadFileSchema>;

interface UploadFileDialogProps {
  isOpen: boolean;
  onClose: () => void;
  entityType: "courses" | "topics" | "lessons";
  entityId: string;
  onFileUploaded?: () => void;
}

export function UploadFileDialog({
  isOpen,
  onClose,
  entityType,
  entityId,
  onFileUploaded,
}: UploadFileDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(
    null
  );
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "uploading" | "completed" | "error"
  >("idle");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mutations
  const createAttachedFileMutation = useCreateAttachedFile();

  const form = useForm<UploadFileFormData>({
    resolver: zodResolver(uploadFileSchema),
    defaultValues: {
      name: { en: "", ar: "", he: "" },
    },
  });

  // Reset form and state when dialog opens/closes
  const handleClose = () => {
    form.reset();
    setSelectedFile(null);
    setUploadProgress(null);
    setUploadStatus("idle");
    setUploadError(null);
    setIsSubmitting(false);
    onClose();
  };

  // File selection handler
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadStatus("idle");
      setUploadProgress(null);
      setUploadError(null);

      // Auto-fill the English name with the file name (without extension)
      const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
      form.setValue("name.en", fileNameWithoutExt);
    }
  };

  // Get file type icon
  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith("image/")) {
      return <Image className="h-5 w-5 text-blue-500" />;
    } else if (fileType.startsWith("video/")) {
      return <Video className="h-5 w-5 text-red-500" />;
    } else if (fileType.startsWith("audio/")) {
      return <Music className="h-5 w-5 text-green-500" />;
    } else {
      return <File className="h-5 w-5 text-gray-500" />;
    }
  };

  // Form submission handler
  const handleSubmit = async (data: UploadFileFormData) => {
    if (!selectedFile) {
      toast.error("Please select a file to upload");
      return;
    }

    try {
      setIsSubmitting(true);
      setUploadStatus("uploading");

      // Step 1: Upload file to S3
      const uploadType = UploadService.getUploadType(selectedFile.type);
      const folder = `${entityType}`;

      const uploadResult = await UploadService.uploadFileWithProgress(
        selectedFile,
        uploadType,
        folder,
        (progress) => setUploadProgress(progress)
      );

      setUploadStatus("completed");

      // Step 2: Create attached file record
      const attachedFileData: CreateAttachedFileInput = {
        name: {
          en: data.name.en,
          ...(data.name.ar && data.name.ar.trim() && { ar: data.name.ar }),
          ...(data.name.he && data.name.he.trim() && { he: data.name.he }),
        },
        fileUrl: uploadResult.key, // Use the S3 key
        fileType: selectedFile.type,
        entityType:
          entityType == "courses"
            ? "course"
            : entityType == "topics"
            ? "topic"
            : "lesson",
        entityId,
      };

      await createAttachedFileMutation.mutateAsync(attachedFileData);

      onFileUploaded?.();
      handleClose();
    } catch (error) {
      setUploadStatus("error");
      setUploadError(
        error instanceof Error ? error.message : "File upload failed"
      );
      // Error toast is handled by the hook
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload File
          </DialogTitle>
          <DialogDescription>
            Upload a file to attach to this {entityType}. Supported formats
            include images, videos, documents, audio files, and more.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            {/* File Selection */}
            <div className="space-y-4">
              <div>
                <FormLabel className="text-base font-medium">
                  Select File *
                </FormLabel>
                <p className="text-sm text-gray-600 mb-3">
                  Choose any file to upload (images, videos, documents, audio,
                  etc.)
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Input
                    type="file"
                    onChange={handleFileSelect}
                    className="flex-1"
                    accept="*/*"
                  />
                  {selectedFile && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedFile(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {selectedFile && (
                  <div className="flex items-center gap-3 p-3 border rounded-lg bg-gray-50">
                    {getFileIcon(selectedFile.type)}
                    <div className="flex-1">
                      <div className="text-sm font-medium">
                        {selectedFile.name}
                      </div>
                      <div className="text-xs text-gray-600">
                        {UploadService.getFileTypeCategory(selectedFile.type)} •{" "}
                        {UploadService.formatBytes(selectedFile.size)}
                      </div>
                    </div>
                  </div>
                )}

                {/* Upload Progress */}
                {uploadStatus === "uploading" && uploadProgress && (
                  <UploadProgressCard
                    progress={uploadProgress}
                    fileName={selectedFile?.name || ""}
                    status="uploading"
                  />
                )}

                {uploadStatus === "completed" && uploadProgress && (
                  <UploadProgressCard
                    progress={uploadProgress}
                    fileName={selectedFile?.name || ""}
                    status="completed"
                  />
                )}

                {uploadStatus === "error" && uploadProgress && (
                  <UploadProgressCard
                    progress={uploadProgress}
                    fileName={selectedFile?.name || ""}
                    status="error"
                    error={uploadError}
                  />
                )}
              </div>
            </div>

            {/* File Name Fields */}
            <div className="space-y-4">
              <div>
                <FormLabel className="text-base font-medium">
                  File Name
                </FormLabel>
                <p className="text-sm text-gray-600 mb-3">
                  Provide a descriptive name for the file in multiple languages.
                </p>
              </div>

              <div className="grid gap-4">
                <FormField
                  control={form.control}
                  name="name.en"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>English Name *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter file name in English"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="name.ar"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Arabic Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter file name in Arabic"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="name.he"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hebrew Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter file name in Hebrew"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  isSubmitting || !selectedFile || uploadStatus === "uploading"
                }
              >
                {isSubmitting
                  ? uploadStatus === "uploading"
                    ? "Uploading..."
                    : "Creating Record..."
                  : "Upload File"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
