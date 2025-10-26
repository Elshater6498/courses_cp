/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRef, useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useNavigate, useParams } from "react-router-dom"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { MultipleSelector } from "@/components/ui/multiple-selector"
import type { Option } from "@/components/ui/multiple-selector"
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  BookOpen,
  Clock,
  Users,
  Video,
  GraduationCap,
} from "lucide-react"
import { toast } from "sonner"

import {
  useCourse,
  useCreateCourse,
  useUpdateCourse,
  useFacultiesGroupedByUniversity,
} from "@/hooks/use-courses"
import { useAdminsByRoleName } from "@/hooks/use-admins"
import { useVideosForSelect } from "@/hooks/use-videos-library"
import { UploadService, type UploadProgress } from "@/services/upload-service"
import { UploadProgressCard } from "@/components/ui/upload-progress"
import RichTextEditor, {
  type RichTextEditorRef,
} from "@/components/ui/RichTextEditor"

// Form schemas
const courseSchema = z.object({
  name: z.object({
    en: z
      .string()
      .min(2, "English name must be at least 2 characters")
      .max(200, "English name cannot exceed 200 characters"),
    ar: z
      .string()
      .min(2, "Arabic name must be at least 2 characters")
      .max(200, "Arabic name cannot exceed 200 characters")
      .optional()
      .or(z.literal("")),
    he: z
      .string()
      .min(2, "Hebrew name must be at least 2 characters")
      .max(200, "Hebrew name cannot exceed 200 characters")
      .optional()
      .or(z.literal("")),
  }),
  aboutCourse: z.object({
    en: z
      .string()
      .min(10, "English description must be at least 10 characters")
      .max(2000, "English description cannot exceed 2000 characters"),
    ar: z
      .string()
      .min(10, "Arabic description must be at least 10 characters")
      .max(2000, "Arabic description cannot exceed 2000 characters")
      .optional()
      .or(z.literal("")),
    he: z
      .string()
      .min(10, "Hebrew description must be at least 10 characters")
      .max(2000, "Hebrew description cannot exceed 2000 characters")
      .optional()
      .or(z.literal("")),
  }),
  whatWillYouLearn: z
    .array(
      z.object({
        en: z
          .string()
          .min(5, "English learning outcome must be at least 5 characters")
          .max(500, "English learning outcome cannot exceed 500 characters"),
        ar: z
          .string()
          .min(5, "Arabic learning outcome must be at least 5 characters")
          .max(500, "Arabic learning outcome cannot exceed 500 characters")
          .optional()
          .or(z.literal("")),
        he: z
          .string()
          .min(5, "Hebrew learning outcome must be at least 5 characters")
          .max(500, "Hebrew learning outcome cannot exceed 500 characters")
          .optional()
          .or(z.literal("")),
      })
    )
    .min(1, "At least one learning outcome is required"),
  numberOfCourseHours: z
    .number()
    .min(1, "Number of course hours must be at least 1")
    .max(1000, "Number of course hours cannot exceed 1000"),
  coursePrice: z
    .number()
    .min(0, "Course price must be at least 0")
    .max(100000, "Course price cannot exceed 100000"),
  discount: z
    .number()
    .min(0, "Discount must be at least 0")
    .max(100, "Discount cannot exceed 100"),
  facultyIds: z
    .array(z.string())
    .min(1, "At least one faculty must be selected"),
  instructorId: z.string().min(1, "Instructor is required"),
  instructorPercentage: z
    .number()
    .min(0, "Instructor percentage must be at least 0")
    .max(100, "Instructor percentage cannot exceed 100"),
  imageUrl: z.string().optional(),
  introductoryVideoId: z.string().optional(),
  isActive: z.boolean(),
})

type CourseFormData = z.infer<typeof courseSchema>

export function CreateCourse() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()

  const [isEditing, setIsEditing] = useState(false)

  // File upload state
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imageUploadProgress, setImageUploadProgress] =
    useState<UploadProgress | null>(null)
  const [imageUploadStatus, setImageUploadStatus] = useState<
    "idle" | "uploading" | "completed" | "error"
  >("idle")
  const [uploadError, setUploadError] = useState<string | null>(null)
  const editorRef = useRef<RichTextEditorRef>(null)

  // Queries
  const { data: courseData, isLoading: isLoadingCourse } = useCourse(id || "")
  const { data: facultiesData } = useFacultiesGroupedByUniversity()
  const { data: adminsData } = useAdminsByRoleName("Instructor")
  const { data: videosData } = useVideosForSelect("course")
  // Mutations
  const createCourseMutation = useCreateCourse()
  const updateCourseMutation = useUpdateCourse()

  // Form
  const form = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      name: { en: "", ar: "", he: "" },
      aboutCourse: { en: "", ar: "", he: "" },
      whatWillYouLearn: [{ en: "", ar: "", he: "" }],
      numberOfCourseHours: 1,
      coursePrice: 0,
      discount: 0,
      facultyIds: [],
      instructorId: "",
      instructorPercentage: 0,
      imageUrl: "",
      introductoryVideoId: "",
      isActive: true,
    },
  })
  console.log(form.formState.errors)
  // Load course data when editing
  useEffect(() => {
    if (id && courseData?.data) {
      const course = courseData.data
      const courseName =
        typeof course.name === "string"
          ? { en: course.name, ar: "", he: "" }
          : course.name

      const courseAbout =
        typeof course.aboutCourse === "string"
          ? { en: course.aboutCourse, ar: "", he: "" }
          : course.aboutCourse

      const facultyIds = Array.isArray(course.facultyIds)
        ? course.facultyIds.map((faculty) =>
            typeof faculty === "string" ? faculty : faculty._id
          )
        : []

      const instructorId =
        typeof course.instructorId === "string"
          ? course.instructorId
          : course.instructorId._id

      form.reset({
        name: {
          en: courseName.en || "",
          ar: courseName.ar || "",
          he: courseName.he || "",
        },
        aboutCourse: {
          en: courseAbout.en || "",
          ar: courseAbout.ar || "",
          he: courseAbout.he || "",
        },
        whatWillYouLearn: Array.isArray(course.whatWillYouLearn)
          ? course.whatWillYouLearn.map((item) =>
              typeof item === "string" ? { en: item, ar: "", he: "" } : item
            )
          : [{ en: "", ar: "", he: "" }],
        numberOfCourseHours: course.numberOfCourseHours,
        coursePrice: course.coursePrice,
        discount: course.discount,
        facultyIds,
        instructorId,
        instructorPercentage: course.instructorPercentage,
        imageUrl: course.imageUrl || "",
        introductoryVideoId: "", // Will be set after videos are loaded
        isActive: course.isActive,
      })
      setIsEditing(true)
    }
  }, [id, courseData, form])

  // Set video ID when videos are loaded and we have an existing video URL
  useEffect(() => {
    if (
      isEditing &&
      courseData?.data?.introductoryVideoUrl &&
      videosData?.data
    ) {
      // Find the video that matches the current video URL
      const matchingVideo = videosData.data.find(
        (video) => video.videoUrl === courseData?.data?.introductoryVideoUrl
      )
      if (matchingVideo) {
        form.setValue("introductoryVideoId", matchingVideo.id)
      }
    }
  }, [isEditing, courseData, videosData, form])

  // Handlers
  const handleSubmit = async (data: CourseFormData) => {
    try {
      // Upload image if selected
      let imageUrl = data.imageUrl || ""
      if (selectedImage) {
        try {
          setImageUploadStatus("uploading")
          const imageResult = await UploadService.uploadFileWithProgress(
            selectedImage,
            "image",
            "courses",
            (progress) => setImageUploadProgress(progress)
          )
          imageUrl = imageResult.downloadUrl
          setImageUploadStatus("completed")
        } catch (error) {
          setImageUploadStatus("error")
          setUploadError(
            error instanceof Error ? error.message : "Image upload failed"
          )
          throw error
        }
      } else if (!isEditing && !data.imageUrl) {
        throw new Error("Course image is required")
      }

      // Get video URL from selected video ID
      let introductoryVideoUrl = ""
      if (data.introductoryVideoId) {
        const selectedVideo = videosData?.data?.find(
          (video) => video.id === data.introductoryVideoId
        )
        if (selectedVideo) {
          introductoryVideoUrl = selectedVideo.videoUrl
        }
      }

      // Clean up empty strings
      const processedData = {
        name: {
          en: data.name.en,
          ...(data.name.ar && data.name.ar.trim() && { ar: data.name.ar }),
          ...(data.name.he && data.name.he.trim() && { he: data.name.he }),
        },
        aboutCourse: {
          en: data.aboutCourse.en,
          ...(data.aboutCourse.ar &&
            data.aboutCourse.ar.trim() && { ar: data.aboutCourse.ar }),
          ...(data.aboutCourse.he &&
            data.aboutCourse.he.trim() && { he: data.aboutCourse.he }),
        },
        whatWillYouLearn: data.whatWillYouLearn.map((item) => ({
          en: item.en,
          ...(item.ar && item.ar.trim() && { ar: item.ar }),
          ...(item.he && item.he.trim() && { he: item.he }),
        })),
        numberOfCourseHours: data.numberOfCourseHours,
        coursePrice: data.coursePrice,
        discount: data.discount,
        facultyIds: data.facultyIds,
        instructorId: data.instructorId,
        instructorPercentage: data.instructorPercentage,
        imageUrl,
        introductoryVideoUrl,
        isActive: data.isActive,
      }

      if (isEditing && id) {
        await updateCourseMutation.mutateAsync({ id, data: processedData })
        toast.success("Course updated successfully!")
      } else {
        await createCourseMutation.mutateAsync(processedData)
        toast.success("Course created successfully!")
      }
      navigate("/dashboard/courses")
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save course"
      )
    }
  }

  const handleAddLearningOutcome = () => {
    const currentOutcomes = form.getValues("whatWillYouLearn")
    form.setValue("whatWillYouLearn", [
      ...currentOutcomes,
      { en: "", ar: "", he: "" },
    ])
  }

  const handleRemoveLearningOutcome = (index: number) => {
    const currentOutcomes = form.getValues("whatWillYouLearn")
    if (currentOutcomes.length > 1) {
      form.setValue(
        "whatWillYouLearn",
        currentOutcomes.filter((_, i) => i !== index)
      )
    }
  }

  // File upload handlers
  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file")
        return
      }
      setSelectedImage(file)
      setImageUploadStatus("idle")
      setImageUploadProgress(null)
      setUploadError(null)
    }
  }

  if (isLoadingCourse) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <p className="text-gray-500">Loading course...</p>
        </div>
      </div>
    )
  }

  if (id && !courseData?.data) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <p className="text-gray-500">Course not found.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-center gap-4 w-full sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 py-4 px-6">
        <div>
          <h1 className="text-3xl font-bold">
            {isEditing ? "Edit Course" : "Create New Course"}
          </h1>
          <p className="text-gray-600">
            {isEditing
              ? "Update course information and settings."
              : "Create a new course with multilingual support."}
          </p>
        </div>
        <div className="flex justify-between items-center gap-4">
          <Button
            variant="outline"
            onClick={() => navigate("/dashboard/courses")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Courses
          </Button>
          <Button
            onClick={form.handleSubmit(handleSubmit)}
            disabled={
              createCourseMutation.isPending ||
              updateCourseMutation.isPending ||
              imageUploadStatus === "uploading"
            }
          >
            <Save className="h-4 w-4 mr-2" />
            {createCourseMutation.isPending || updateCourseMutation.isPending
              ? "Saving..."
              : imageUploadStatus === "uploading"
              ? "Uploading image..."
              : "Save Course"}
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
                Enter the course name and description in multiple languages.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Course Name */}
              <div className="grid gap-4">
                <FormField
                  control={form.control}
                  name="name.en"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Course Name (English) *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter course name in English"
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
                      <FormLabel>Course Name (Arabic)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter course name in Arabic"
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
                      <FormLabel>Course Name (Hebrew)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter course name in Hebrew"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Course Description */}
              <div className="grid gap-4">
                <FormField
                  control={form.control}
                  name="aboutCourse.en"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Course Description (English) *</FormLabel>
                      <FormControl>
                        <RichTextEditor
                          ref={editorRef}
                          value={field.value}
                          onChange={(content) => field.onChange(content)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="aboutCourse.ar"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Course Description (Arabic)</FormLabel>
                      <FormControl>
                        <RichTextEditor
                          ref={editorRef}
                          value={field.value}
                          onChange={(content) => field.onChange(content)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="aboutCourse.he"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Course Description (Hebrew)</FormLabel>
                      <FormControl>
                        <RichTextEditor
                          ref={editorRef}
                          value={field.value}
                          onChange={(content) => field.onChange(content)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Learning Outcomes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Learning Outcomes
              </CardTitle>
              <CardDescription>
                Define what students will learn from this course.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {form.watch("whatWillYouLearn").map((_, index) => (
                <div key={index} className="space-y-4 p-4 border rounded-lg">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">
                      Learning Outcome {index + 1}
                    </h4>
                    {form.watch("whatWillYouLearn").length > 1 && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveLearningOutcome(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <div className="grid gap-4">
                    <FormField
                      control={form.control}
                      name={`whatWillYouLearn.${index}.en`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>English *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter learning outcome in English"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`whatWillYouLearn.${index}.ar`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Arabic</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter learning outcome in Arabic"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`whatWillYouLearn.${index}.he`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hebrew</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter learning outcome in Hebrew"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={handleAddLearningOutcome}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Learning Outcome
              </Button>
            </CardContent>
          </Card>

          {/* Course Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Course Details
              </CardTitle>
              <CardDescription>
                Set course duration, pricing, and instructor information.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="numberOfCourseHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Course Hours *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter course hours"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value) || 0)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="coursePrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Course Price *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter course price"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value) || 0)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="discount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Discount (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter discount percentage"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value) || 0)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="instructorId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instructor *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an instructor" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {adminsData?.data?.map((admin) => (
                            <SelectItem key={admin._id} value={admin._id}>
                              {admin.userName} ({admin.email})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="instructorPercentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instructor Percentage *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter instructor percentage"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value) || 0)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Faculties */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Associated Faculties
              </CardTitle>
              <CardDescription>
                Select the faculties this course belongs to.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="facultyIds"
                render={({ field }) => {
                  // Transform grouped data to flat options with group information
                  const options: Option[] = []
                  facultiesData?.data?.map((group) => {
                    group.faculties.map((faculty) => {
                      options.push({
                        label: `${
                          typeof faculty.name === "string"
                            ? faculty.name
                            : faculty.name.en
                        } (${group.universityName.en})`,
                        value: faculty._id,
                        group: group.universityName.en,
                      })
                    })
                  })
                  return (
                    <FormItem>
                      <FormLabel>Faculties *</FormLabel>
                      <FormControl>
                        <MultipleSelector
                          options={options}
                          value={field.value?.map((value) => {
                            const option = options.find(
                              (opt) => opt.value === value
                            )
                            return option || { label: value, value }
                          })}
                          onChange={(selectedOptions) => {
                            field.onChange(
                              selectedOptions.map((opt) => opt.value)
                            )
                          }}
                          placeholder="Select faculties..."
                          maxSelected={5}
                          groupBy="group"
                          emptyIndicator={
                            <p className="text-center text-lg leading-10 text-gray-600 dark:text-gray-400">
                              No faculties found.
                            </p>
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )
                }}
              />
            </CardContent>
          </Card>

          {/* Media Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5" />
                Media Upload
              </CardTitle>
              <CardDescription>
                Upload course image (required) and introductory video
                (optional).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Image Upload */}
              <div className="space-y-4">
                <div>
                  <FormLabel className="text-base font-medium">
                    Course Image *
                  </FormLabel>
                  <p className="text-sm text-gray-600 mb-3">
                    Upload a high-quality image for your course (JPG, PNG, GIF,
                    WebP, SVG)
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="flex-1"
                    />
                    {selectedImage && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedImage(null)}
                      >
                        Clear
                      </Button>
                    )}
                  </div>

                  {selectedImage && (
                    <div className="text-sm text-gray-600">
                      Selected: {selectedImage.name} (
                      {UploadService.formatBytes(selectedImage.size)})
                    </div>
                  )}

                  {imageUploadStatus === "uploading" && imageUploadProgress && (
                    <UploadProgressCard
                      progress={imageUploadProgress}
                      fileName={selectedImage?.name || ""}
                      status="uploading"
                    />
                  )}

                  {imageUploadStatus === "completed" && (
                    <UploadProgressCard
                      progress={imageUploadProgress!}
                      fileName={selectedImage?.name || ""}
                      status="completed"
                    />
                  )}

                  {imageUploadStatus === "error" && (
                    <UploadProgressCard
                      progress={imageUploadProgress!}
                      fileName={selectedImage?.name || ""}
                      status="error"
                      error={uploadError}
                    />
                  )}

                  {/* Show existing image when editing */}
                  {isEditing &&
                    courseData?.data?.imageUrl &&
                    !selectedImage && (
                      <div className="mt-3 p-3 border rounded-lg bg-gray-50">
                        <p className="text-sm text-gray-600 mb-2">
                          Current image:
                        </p>
                        <img
                          src={courseData.data.imageUrl}
                          alt="Current course image"
                          className="max-w-xs h-auto rounded border"
                        />
                      </div>
                    )}
                </div>
              </div>

              {/* Video Selection */}
              <div className="space-y-4">
                <div>
                  <FormLabel className="text-base font-medium">
                    Introductory Video
                  </FormLabel>
                  <p className="text-sm text-gray-600 mb-3">
                    Select an introductory video from your video library
                  </p>
                </div>

                <FormField
                  control={form.control}
                  name="introductoryVideoId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select Video</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a video from library" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={null as any}>
                            No video selected
                          </SelectItem>
                          {videosData?.data?.map((video) => (
                            <SelectItem key={video.id} value={video.id}>
                              {video.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Show selected video preview */}
                {form.watch("introductoryVideoId") && (
                  <div className="mt-3 p-3 border rounded-lg bg-gray-50">
                    <p className="text-sm text-gray-600 mb-2">
                      Selected video:
                    </p>
                    <div className="text-sm font-medium">
                      {
                        videosData?.data?.find(
                          (video) =>
                            video.id === form.watch("introductoryVideoId")
                        )?.name
                      }
                    </div>
                  </div>
                )}
              </div>

              {/* Hidden form fields for validation */}
              <FormField
                control={form.control}
                name="imageUrl"
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

          {/* Course Status */}
          <Card>
            <CardHeader>
              <CardTitle>Course Status</CardTitle>
              <CardDescription>
                Control whether the course is active or inactive.
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
                        Enable or disable this course
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
        </form>
      </Form>
    </div>
  )
}
