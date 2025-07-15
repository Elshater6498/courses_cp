import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, useParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MultiSelect } from "@/components/ui/multi-select";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  BookOpen,
  Clock,
  DollarSign,
  Users,
  Video,
  Image,
  GraduationCap,
} from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/authStore";
import {
  useCourse,
  useCreateCourse,
  useUpdateCourse,
  useAllFaculties,
  useAllAdmins,
} from "@/hooks/useCourses";
import type { Course, CreateCourseInput, UpdateCourseInput } from "@/types/api";

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
  imageUrl: z.string().url("Please provide a valid image URL"),
  introductoryVideoUrl: z.string().url("Please provide a valid video URL"),
  isActive: z.boolean(),
});

type CourseFormData = z.infer<typeof courseSchema>;

export function CourseDetails() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { hasPermission } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);

  // Queries
  const { data: courseData, isLoading: isLoadingCourse } = useCourse(id || "");
  const { data: facultiesData } = useAllFaculties();
  const { data: adminsData } = useAllAdmins();

  // Mutations
  const createCourseMutation = useCreateCourse();
  const updateCourseMutation = useUpdateCourse();

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
      introductoryVideoUrl: "",
      isActive: true,
    },
  });

  // Load course data when editing
  useEffect(() => {
    if (id && courseData?.data) {
      const course = courseData.data;
      const courseName =
        typeof course.name === "string"
          ? { en: course.name, ar: "", he: "" }
          : course.name;

      const courseAbout =
        typeof course.aboutCourse === "string"
          ? { en: course.aboutCourse, ar: "", he: "" }
          : course.aboutCourse;

      const facultyIds = Array.isArray(course.facultyIds)
        ? course.facultyIds.map((faculty) =>
            typeof faculty === "string" ? faculty : faculty._id
          )
        : [];

      const instructorId =
        typeof course.instructorId === "string"
          ? course.instructorId
          : course.instructorId._id;

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
        imageUrl: course.imageUrl,
        introductoryVideoUrl: course.introductoryVideoUrl,
        isActive: course.isActive,
      });
      setIsEditing(true);
    }
  }, [id, courseData, form]);

  // Handlers
  const handleSubmit = async (data: CourseFormData) => {
    try {
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
        imageUrl: data.imageUrl,
        introductoryVideoUrl: data.introductoryVideoUrl,
        isActive: data.isActive,
      };

      if (isEditing && id) {
        await updateCourseMutation.mutateAsync({ id, data: processedData });
        toast.success("Course updated successfully!");
      } else {
        await createCourseMutation.mutateAsync(processedData);
        toast.success("Course created successfully!");
      }
      navigate("/courses");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save course"
      );
    }
  };

  const handleAddLearningOutcome = () => {
    const currentOutcomes = form.getValues("whatWillYouLearn");
    form.setValue("whatWillYouLearn", [
      ...currentOutcomes,
      { en: "", ar: "", he: "" },
    ]);
  };

  const handleRemoveLearningOutcome = (index: number) => {
    const currentOutcomes = form.getValues("whatWillYouLearn");
    if (currentOutcomes.length > 1) {
      form.setValue(
        "whatWillYouLearn",
        currentOutcomes.filter((_, i) => i !== index)
      );
    }
  };

  const canCreate = hasPermission("create_courses");
  const canUpdate = hasPermission("update_courses");

  if (isLoadingCourse) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <p className="text-gray-500">Loading course...</p>
        </div>
      </div>
    );
  }

  if (id && !courseData?.data) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <p className="text-gray-500">Course not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/courses")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Courses
          </Button>
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
        </div>
        <Button
          onClick={form.handleSubmit(handleSubmit)}
          disabled={
            createCourseMutation.isPending || updateCourseMutation.isPending
          }
        >
          <Save className="h-4 w-4 mr-2" />
          {createCourseMutation.isPending || updateCourseMutation.isPending
            ? "Saving..."
            : "Save Course"}
        </Button>
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
                        <Textarea
                          placeholder="Enter course description in English"
                          rows={4}
                          {...field}
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
                        <Textarea
                          placeholder="Enter course description in Arabic"
                          rows={4}
                          {...field}
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
                        <Textarea
                          placeholder="Enter course description in Hebrew"
                          rows={4}
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
                          {adminsData?.data?.items?.map((admin) => (
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
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Faculties *</FormLabel>
                    <FormControl>
                      <MultiSelect
                        options={
                          facultiesData?.data?.map((faculty) => ({
                            label:
                              typeof faculty.name === "string"
                                ? faculty.name
                                : faculty.name.en,
                            value: faculty._id,
                          })) || []
                        }
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        placeholder="Select faculties..."
                        maxCount={5}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Media URLs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5" />
                Media URLs
              </CardTitle>
              <CardDescription>
                Provide URLs for course image and introductory video.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course Image URL *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter course image URL" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="introductoryVideoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Introductory Video URL *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter introductory video URL"
                        {...field}
                      />
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
  );
}
