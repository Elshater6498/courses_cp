import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  ArrowLeft,
  Save,
  Upload,
  Video,
  FileVideo,
  AlertCircle,
  BookOpen,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/authStore";
import {
  useCreateLesson,
  useUpdateLesson,
  useLesson,
} from "@/hooks/useLessons";
import { useTopic } from "@/hooks/useTopics";
import {
  UploadService,
  type UploadResult,
  type UploadProgress,
} from "@/services/uploadService";
import { UploadProgressCard } from "@/components/ui/upload-progress";
import type { CreateLessonInput, UpdateLessonInput } from "@/types/api";

// Form validation schema
const lessonSchema = z.object({
  name: z.object({
    en: z.string().min(2, "English name must be at least 2 characters"),
    ar: z.string().optional(),
    he: z.string().optional(),
  }),
  description: z
    .object({
      en: z
        .string()
        .min(2, "English description must be at least 2 characters"),
      ar: z.string().optional(),
      he: z.string().optional(),
    })
    .optional(),
  topicId: z.string().min(1, "Topic is required"),
  main_recording_url: z.string().optional(),
  recording_gvo_url: z.string().optional(),
  recording_vvt_url: z.string().optional(),
  isActive: z.boolean(),
});

type LessonFormData = z.infer<typeof lessonSchema>;

export function CreateUpdateLesson() {
  const { topicId, lessonId } = useParams<{
    topicId: string;
    lessonId?: string;
  }>();
  const navigate = useNavigate();
  const { hasPermission } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedMainRecording, setSelectedMainRecording] =
    useState<File | null>(null);
  const [selectedGvoRecording, setSelectedGvoRecording] = useState<File | null>(
    null
  );
  const [selectedVvtRecording, setSelectedVvtRecording] = useState<File | null>(
    null
  );

  // Upload states
  const [mainRecordingUploadStatus, setMainRecordingUploadStatus] = useState<
    "idle" | "uploading" | "completed" | "error"
  >("idle");
  const [gvoRecordingUploadStatus, setGvoRecordingUploadStatus] = useState<
    "idle" | "uploading" | "completed" | "error"
  >("idle");
  const [vvtRecordingUploadStatus, setVvtRecordingUploadStatus] = useState<
    "idle" | "uploading" | "completed" | "error"
  >("idle");

  const [mainRecordingUploadProgress, setMainRecordingUploadProgress] =
    useState<UploadProgress | null>(null);
  const [gvoRecordingUploadProgress, setGvoRecordingUploadProgress] =
    useState<UploadProgress | null>(null);
  const [vvtRecordingUploadProgress, setVvtRecordingUploadProgress] =
    useState<UploadProgress | null>(null);
  const [uploadError, setUploadError] = useState<string>("");

  // Determine if we're editing or creating
  const isEditing = !!lessonId;

  // Queries
  const { data: lessonData, isLoading: isLoadingLesson } = useLesson(lessonId!);
  const { data: topicData } = useTopic(topicId!);

  // Mutations
  const createLessonMutation = useCreateLesson();
  const updateLessonMutation = useUpdateLesson();

  // Form setup
  const form = useForm<LessonFormData>({
    resolver: zodResolver(lessonSchema),
    defaultValues: {
      name: {
        en: "",
        ar: "",
        he: "",
      },
      description: {
        en: "",
        ar: "",
        he: "",
      },
      topicId: topicId || "",
      main_recording_url: "",
      recording_gvo_url: "",
      recording_vvt_url: "",
      isActive: true,
    },
  });

  // Set form data when lesson data is loaded (for editing)
  useEffect(() => {
    if (isEditing && lessonData?.data) {
      const lesson = lessonData.data;

      // Handle multilingual fields
      const name =
        typeof lesson.name === "string"
          ? { en: lesson.name, ar: "", he: "" }
          : lesson.name;

      const description =
        typeof lesson.description === "string"
          ? { en: lesson.description, ar: "", he: "" }
          : lesson.description || { en: "", ar: "", he: "" };

      form.reset({
        name,
        description,
        topicId:
          typeof lesson.topicId === "string"
            ? lesson.topicId
            : lesson.topicId._id,
        main_recording_url: lesson.main_recording_url,
        recording_gvo_url: lesson.recording_gvo_url || "",
        recording_vvt_url: lesson.recording_vvt_url || "",
        isActive: lesson.isActive,
      });
    }
  }, [lessonData, form, isEditing]);

  // Set topic ID when available
  useEffect(() => {
    if (topicId) {
      form.setValue("topicId", topicId);
    }
  }, [topicId, form]);

  // Check permissions
  const canCreate = hasPermission("create_lessons");
  const canUpdate = hasPermission("update_lessons");

  if (isEditing && !canUpdate) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-gray-600">
            You don't have permission to update lessons.
          </p>
        </div>
      </div>
    );
  }

  if (!isEditing && !canCreate) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-gray-600">
            You don't have permission to create lessons.
          </p>
        </div>
      </div>
    );
  }

  if (isEditing && isLoadingLesson) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-blue-500 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading lesson...</p>
        </div>
      </div>
    );
  }

  if (isEditing && !lessonData?.data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Lesson Not Found</h2>
          <p className="text-gray-600">
            The lesson you're looking for doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  // File selection handlers
  const handleMainRecordingSelect = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("video/")) {
        toast.error("Please select a valid video file");
        return;
      }
      setSelectedMainRecording(file);
      setMainRecordingUploadStatus("idle");
      setMainRecordingUploadProgress(null);
      setUploadError("");
    }
  };

  const handleGvoRecordingSelect = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("video/")) {
        toast.error("Please select a valid video file");
        return;
      }
      setSelectedGvoRecording(file);
      setGvoRecordingUploadStatus("idle");
      setGvoRecordingUploadProgress(null);
      setUploadError("");
    }
  };

  const handleVvtRecordingSelect = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("video/")) {
        toast.error("Please select a valid video file");
        return;
      }
      setSelectedVvtRecording(file);
      setVvtRecordingUploadStatus("idle");
      setVvtRecordingUploadProgress(null);
      setUploadError("");
    }
  };

  // Upload files
  const uploadFiles = async (): Promise<{
    mainRecordingUrl: string;
    gvoRecordingUrl?: string;
    vvtRecordingUrl?: string;
  }> => {
    const uploads: Promise<UploadResult>[] = [];

    // Upload main recording (required)
    if (selectedMainRecording) {
      setMainRecordingUploadStatus("uploading");
      const mainUpload = UploadService.uploadFileWithProgress(
        selectedMainRecording,
        "video",
        "lessons",
        (progress) => setMainRecordingUploadProgress(progress)
      );
      uploads.push(mainUpload);
    } else if (!isEditing) {
      // Only require main recording for new lessons
      throw new Error("Main recording is required");
    }

    // Upload GVO recording (optional)
    if (selectedGvoRecording) {
      setGvoRecordingUploadStatus("uploading");
      const gvoUpload = UploadService.uploadFileWithProgress(
        selectedGvoRecording,
        "video",
        "lessons",
        (progress) => setGvoRecordingUploadProgress(progress)
      );
      uploads.push(gvoUpload);
    }

    // Upload VVT recording (optional)
    if (selectedVvtRecording) {
      setVvtRecordingUploadStatus("uploading");
      const vvtUpload = UploadService.uploadFileWithProgress(
        selectedVvtRecording,
        "video",
        "lessons",
        (progress) => setVvtRecordingUploadProgress(progress)
      );
      uploads.push(vvtUpload);
    }

    try {
      const results = await Promise.all(uploads);

      // Set upload status to completed
      if (selectedMainRecording) {
        setMainRecordingUploadStatus("completed");
      }
      if (selectedGvoRecording) {
        setGvoRecordingUploadStatus("completed");
      }
      if (selectedVvtRecording) {
        setVvtRecordingUploadStatus("completed");
      }

      return {
        mainRecordingUrl: results[0].downloadUrl,
        gvoRecordingUrl: results[1]?.downloadUrl,
        vvtRecordingUrl: results[2]?.downloadUrl,
      };
    } catch (error) {
      // Set upload status to error
      if (selectedMainRecording) {
        setMainRecordingUploadStatus("error");
      }
      if (selectedGvoRecording) {
        setGvoRecordingUploadStatus("error");
      }
      if (selectedVvtRecording) {
        setVvtRecordingUploadStatus("error");
      }

      setUploadError(error instanceof Error ? error.message : "Upload failed");
      throw error;
    }
  };

  // Form submission
  const handleSubmit = async (data: LessonFormData) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setUploadError("");

    try {
      // Upload files if selected
      let fileUrls: {
        mainRecordingUrl: string;
        gvoRecordingUrl?: string;
        vvtRecordingUrl?: string;
      } = {
        mainRecordingUrl: data.main_recording_url || "",
        gvoRecordingUrl: data.recording_gvo_url || "",
        vvtRecordingUrl: data.recording_vvt_url || "",
      };

      if (
        selectedMainRecording ||
        selectedGvoRecording ||
        selectedVvtRecording
      ) {
        fileUrls = await uploadFiles();
      }

      if (isEditing) {
        // Update lesson
        const lessonData: UpdateLessonInput = {
          name: {
            en: data.name.en,
            ...(data.name.ar && data.name.ar.trim() && { ar: data.name.ar }),
            ...(data.name.he && data.name.he.trim() && { he: data.name.he }),
          },
          description: {
            en: data.description?.en || "",
            ...(data.description?.ar &&
              data.description?.ar.trim() && { ar: data.description?.ar }),
            ...(data.description?.he &&
              data.description?.he.trim() && { he: data.description?.he }),
          },
          topicId: data.topicId,
          main_recording_url: fileUrls.mainRecordingUrl,
          recording_gvo_url: fileUrls.gvoRecordingUrl || undefined,
          recording_vvt_url: fileUrls.vvtRecordingUrl || undefined,
          isActive: data.isActive,
        };

        await updateLessonMutation.mutateAsync({
          id: lessonId!,
          data: lessonData,
        });

        toast.success("Lesson updated successfully!");
      } else {
        // Create lesson
        const lessonData: CreateLessonInput = {
          name: {
            en: data.name.en,
            ...(data.name.ar && data.name.ar.trim() && { ar: data.name.ar }),
            ...(data.name.he && data.name.he.trim() && { he: data.name.he }),
          },
          description: data.description
            ? {
                en: data.description.en,
                ...(data.description.ar &&
                  data.description.ar.trim() && { ar: data.description.ar }),
                ...(data.description.he &&
                  data.description.he.trim() && { he: data.description.he }),
              }
            : undefined,
          topicId: data.topicId,
          main_recording_url: fileUrls.mainRecordingUrl,
          recording_gvo_url: fileUrls.gvoRecordingUrl || undefined,
          recording_vvt_url: fileUrls.vvtRecordingUrl || undefined,
        };

        await createLessonMutation.mutateAsync(lessonData);

        toast.success("Lesson created successfully!");
      }

      navigate(`/dashboard/courses/topics/${topicId}/lessons`);
    } catch (error) {
      console.error("Error saving lesson:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to save lesson"
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  console.log(form.formState.errors);
  // Helper function to get topic name
  const getTopicName = () => {
    if (!topicData?.data) return "Loading...";
    const topic = topicData.data;
    if (typeof topic.name === "string") {
      return topic.name;
    }
    return topic.name.en || "Unknown Topic";
  };

  // Helper function to get lesson name
  const getLessonName = () => {
    if (!isEditing || !lessonData?.data) return "";
    const lesson = lessonData.data;
    if (typeof lesson.name === "string") {
      return lesson.name;
    }
    return lesson.name.en || "Unknown Lesson";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 py-4 -mx-6 px-6 mb-6">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">
              {isEditing ? "Edit Lesson" : "Create Lesson"}
            </h1>
            <p className="text-gray-600">
              {isEditing
                ? `Update lesson: ${getLessonName()}`
                : `Add a new lesson to: ${getTopicName()}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              navigate(`/dashboard/courses/topics/${topicId}/lessons`)
            }
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Lessons
          </Button>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Basic Information
              </CardTitle>
              <CardDescription>
                Provide the basic details for your lesson.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Lesson Name */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="name.en"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lesson Name (English) *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter lesson name in English"
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
                      <FormLabel>Lesson Name (Arabic)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter lesson name in Arabic"
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
                      <FormLabel>Lesson Name (Hebrew)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter lesson name in Hebrew"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Lesson Description */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="description.en"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (English) *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter lesson description in English"
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description.ar"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Arabic)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter lesson description in Arabic"
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description.he"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Hebrew)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter lesson description in Hebrew"
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Recording Uploads */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5" />
                Recording Uploads
              </CardTitle>
              <CardDescription>
                Upload video recordings for your lesson. Main recording is
                {isEditing ? " optional when editing" : " required"}.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Main Recording */}
              <div className="space-y-4">
                <div>
                  <FormLabel className="text-base font-medium">
                    Main Recording {!isEditing && "*"}
                  </FormLabel>
                  <p className="text-sm text-gray-600 mb-3">
                    Upload the main video recording for this lesson (MP4, MPEG,
                    MOV, AVI, WebM, OGG)
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Input
                      type="file"
                      accept="video/*"
                      onChange={handleMainRecordingSelect}
                      className="flex-1"
                    />
                    {selectedMainRecording && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedMainRecording(null)}
                      >
                        Clear
                      </Button>
                    )}
                  </div>

                  {selectedMainRecording && (
                    <div className="text-sm text-gray-600">
                      Selected: {selectedMainRecording.name} (
                      {UploadService.formatBytes(selectedMainRecording.size)})
                    </div>
                  )}

                  {mainRecordingUploadStatus === "uploading" &&
                    mainRecordingUploadProgress && (
                      <UploadProgressCard
                        progress={mainRecordingUploadProgress}
                        fileName={selectedMainRecording?.name || ""}
                        fileSize={selectedMainRecording?.size || 0}
                        status="uploading"
                      />
                    )}

                  {mainRecordingUploadStatus === "completed" &&
                    mainRecordingUploadProgress && (
                      <UploadProgressCard
                        progress={mainRecordingUploadProgress}
                        fileName={selectedMainRecording?.name || ""}
                        fileSize={selectedMainRecording?.size || 0}
                        status="completed"
                      />
                    )}

                  {mainRecordingUploadStatus === "error" &&
                    mainRecordingUploadProgress && (
                      <UploadProgressCard
                        progress={mainRecordingUploadProgress}
                        fileName={selectedMainRecording?.name || ""}
                        fileSize={selectedMainRecording?.size || 0}
                        status="error"
                        error={uploadError}
                      />
                    )}

                  {/* Show existing recording when editing and not uploading new one */}
                  {isEditing &&
                    !selectedMainRecording &&
                    lessonData?.data?.main_recording_url && (
                      <div className="mt-3 p-3 border rounded-lg bg-gray-50">
                        <p className="text-sm text-gray-600 mb-2">
                          Current main recording:
                        </p>
                        <video
                          src={lessonData.data.main_recording_url}
                          controls
                          className="max-w-xs h-auto rounded border"
                        />
                      </div>
                    )}
                </div>
              </div>

              {/* GVO Recording */}
              <div className="space-y-4">
                <div>
                  <FormLabel className="text-base font-medium">
                    GVO Recording
                  </FormLabel>
                  <p className="text-sm text-gray-600 mb-3">
                    Upload GVO video recording (optional)
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Input
                      type="file"
                      accept="video/*"
                      onChange={handleGvoRecordingSelect}
                      className="flex-1"
                    />
                    {selectedGvoRecording && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedGvoRecording(null)}
                      >
                        Clear
                      </Button>
                    )}
                  </div>

                  {selectedGvoRecording && (
                    <div className="text-sm text-gray-600">
                      Selected: {selectedGvoRecording.name} (
                      {UploadService.formatBytes(selectedGvoRecording.size)})
                    </div>
                  )}

                  {gvoRecordingUploadStatus === "uploading" &&
                    gvoRecordingUploadProgress && (
                      <UploadProgressCard
                        progress={gvoRecordingUploadProgress}
                        fileName={selectedGvoRecording?.name || ""}
                        fileSize={selectedGvoRecording?.size || 0}
                        status="uploading"
                      />
                    )}

                  {gvoRecordingUploadStatus === "completed" &&
                    gvoRecordingUploadProgress && (
                      <UploadProgressCard
                        progress={gvoRecordingUploadProgress}
                        fileName={selectedGvoRecording?.name || ""}
                        fileSize={selectedGvoRecording?.size || 0}
                        status="completed"
                      />
                    )}

                  {gvoRecordingUploadStatus === "error" &&
                    gvoRecordingUploadProgress && (
                      <UploadProgressCard
                        progress={gvoRecordingUploadProgress}
                        fileName={selectedGvoRecording?.name || ""}
                        fileSize={selectedGvoRecording?.size || 0}
                        status="error"
                        error={uploadError}
                      />
                    )}

                  {/* Show existing recording when editing and not uploading new one */}
                  {isEditing &&
                    !selectedGvoRecording &&
                    lessonData?.data?.recording_gvo_url && (
                      <div className="mt-3 p-3 border rounded-lg bg-gray-50">
                        <p className="text-sm text-gray-600 mb-2">
                          Current GVO recording:
                        </p>
                        <video
                          src={lessonData.data.recording_gvo_url}
                          controls
                          className="max-w-xs h-auto rounded border"
                        />
                      </div>
                    )}
                </div>
              </div>

              {/* VVT Recording */}
              <div className="space-y-4">
                <div>
                  <FormLabel className="text-base font-medium">
                    VVT Recording
                  </FormLabel>
                  <p className="text-sm text-gray-600 mb-3">
                    Upload VVT video recording (optional)
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Input
                      type="file"
                      accept="video/*"
                      onChange={handleVvtRecordingSelect}
                      className="flex-1"
                    />
                    {selectedVvtRecording && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedVvtRecording(null)}
                      >
                        Clear
                      </Button>
                    )}
                  </div>

                  {selectedVvtRecording && (
                    <div className="text-sm text-gray-600">
                      Selected: {selectedVvtRecording.name} (
                      {UploadService.formatBytes(selectedVvtRecording.size)})
                    </div>
                  )}

                  {vvtRecordingUploadStatus === "uploading" &&
                    vvtRecordingUploadProgress && (
                      <UploadProgressCard
                        progress={vvtRecordingUploadProgress}
                        fileName={selectedVvtRecording?.name || ""}
                        fileSize={selectedVvtRecording?.size || 0}
                        status="uploading"
                      />
                    )}

                  {vvtRecordingUploadStatus === "completed" &&
                    vvtRecordingUploadProgress && (
                      <UploadProgressCard
                        progress={vvtRecordingUploadProgress}
                        fileName={selectedVvtRecording?.name || ""}
                        fileSize={selectedVvtRecording?.size || 0}
                        status="completed"
                      />
                    )}

                  {vvtRecordingUploadStatus === "error" &&
                    vvtRecordingUploadProgress && (
                      <UploadProgressCard
                        progress={vvtRecordingUploadProgress}
                        fileName={selectedVvtRecording?.name || ""}
                        fileSize={selectedVvtRecording?.size || 0}
                        status="error"
                        error={uploadError}
                      />
                    )}

                  {/* Show existing recording when editing and not uploading new one */}
                  {isEditing &&
                    !selectedVvtRecording &&
                    lessonData?.data?.recording_vvt_url && (
                      <div className="mt-3 p-3 border rounded-lg bg-gray-50">
                        <p className="text-sm text-gray-600 mb-2">
                          Current VVT recording:
                        </p>
                        <video
                          src={lessonData.data.recording_vvt_url}
                          controls
                          className="max-w-xs h-auto rounded border"
                        />
                      </div>
                    )}
                </div>
              </div>

              {/* Hidden form fields for validation */}
              <FormField
                control={form.control}
                name="main_recording_url"
                render={({ field }) => (
                  <FormItem className="hidden">
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="recording_gvo_url"
                render={({ field }) => (
                  <FormItem className="hidden">
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="recording_vvt_url"
                render={({ field }) => (
                  <FormItem className="hidden">
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Lesson Status */}
          <Card>
            <CardHeader>
              <CardTitle>Lesson Status</CardTitle>
              <CardDescription>
                Control whether the lesson is active or inactive.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Active Status</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Enable or disable this lesson
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                navigate(`/dashboard/courses/topics/${topicId}/lessons`)
              }
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              <Save className="mr-2 h-4 w-4" />
              {isSubmitting
                ? isEditing
                  ? "Updating..."
                  : "Creating..."
                : isEditing
                ? "Update Lesson"
                : "Create Lesson"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
