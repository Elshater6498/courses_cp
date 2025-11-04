import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Upload,
  Plus,
  Download,
  Trash2,
  FileText,
  Image,
  Video,
  Music,
  File,
  Calendar,
  User,
  ArrowLeft,
} from "lucide-react";
import { useLesson } from "@/hooks/use-lessons";
import {
  useAttachedFiles,
  useDeleteAttachedFile,
  usePresignedDownloadUrl,
} from "@/hooks/use-attached-files";
import { type AttachedFile } from "@/services/attached-files-service";
import { UploadFileDialog } from "../course-files/upload-file-dialog";
import { UploadService } from "@/services/upload-service";

export function LessonFilesPage() {
  const { lessonId, courseId, topicId } = useParams<{
    lessonId: string;
    courseId: string;
    topicId: string;
  }>();
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [deleteFileId, setDeleteFileId] = useState<string>("");
  const [deleteFileName, setDeleteFileName] = useState<string>("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Queries
  const { data: lessonData } = useLesson(lessonId!);
  const { data: attachedFilesData, isLoading: isLoadingFiles } =
    useAttachedFiles("lesson", lessonId!);

  // Mutations
  const deleteFileMutation = useDeleteAttachedFile();
  const downloadUrlMutation = usePresignedDownloadUrl();

  // Handlers
  const handleFileUploaded = () => {
    // The hook will automatically invalidate queries
  };

  const handleDeleteFile = (fileId: string, fileName: string) => {
    setDeleteFileId(fileId);
    setDeleteFileName(fileName);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteFile = () => {
    deleteFileMutation.mutate(deleteFileId);
    setIsDeleteDialogOpen(false);
    setDeleteFileId("");
    setDeleteFileName("");
  };

  const handleDownloadFile = async (file: AttachedFile) => {
    try {
      const response = await downloadUrlMutation.mutateAsync({
        fileId: file._id,
      });
      if (response.data?.downloadUrl) {
        // Create a temporary link to download the file
        const link = document.createElement("a");
        link.href = response.data.downloadUrl;
        link.download = file.name.en || "download";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      // Error is already handled by the hook
    }
  };

  // Get file type icon
  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith("image/")) {
      return <Image className="h-4 w-4 text-blue-500" />;
    } else if (fileType.startsWith("video/")) {
      return <Video className="h-4 w-4 text-red-500" />;
    } else if (fileType.startsWith("audio/")) {
      return <Music className="h-4 w-4 text-green-500" />;
    } else {
      return <File className="h-4 w-4 text-gray-500" />;
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const attachedFiles = attachedFilesData?.data || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <Link to={`/dashboard/courses/${courseId}/topics/${topicId}/lessons`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Topic Lessons
          </Button>
        </Link>
        <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Lesson Files</h1>
            <p className="text-gray-600">
              Manage files attached to "
              {typeof lessonData?.data?.name === "string"
                ? lessonData.data.name
                : lessonData?.data?.name?.en || "this lesson"}
              "
            </p>
          </div>
          <Button onClick={() => setIsUploadDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Upload File
          </Button>
        </div>
      </div>

      {/* Files List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Attached Files ({attachedFiles.length})
          </CardTitle>
          <CardDescription>
            Files that have been uploaded and attached to this lesson.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingFiles ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading files...</p>
            </div>
          ) : attachedFiles.length === 0 ? (
            <div className="text-center py-8">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No files uploaded
              </h3>
              <p className="text-gray-500 mb-4">
                Get started by uploading your first file to this lesson.
              </p>
              <Button onClick={() => setIsUploadDialogOpen(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Upload File
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>File</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Uploaded By</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attachedFiles.map((file) => (
                  <TableRow key={file._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {getFileIcon(file.fileType)}
                        <div>
                          <div className="font-medium">{file.name as any}</div>
                          {file.name.ar && (
                            <div className="text-sm text-gray-500">
                              {file.name.ar}
                            </div>
                          )}
                          {file.name.he && (
                            <div className="text-sm text-gray-500">
                              {file.name.he}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {UploadService.getFileTypeCategory(file.fileType)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">
                          {file.uploadedBy.userName}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">
                          {formatDate(file.createdAt)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownloadFile(file)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-600"
                          onClick={() =>
                            handleDeleteFile(file._id, file.name as any)
                          }
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Upload Dialog */}
      <UploadFileDialog
        isOpen={isUploadDialogOpen}
        onClose={() => setIsUploadDialogOpen(false)}
        entityType="lessons"
        entityId={lessonId!}
        onFileUploaded={handleFileUploaded}
      />

      {/* Delete File Alert Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete File</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteFileName}"? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteFile}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
