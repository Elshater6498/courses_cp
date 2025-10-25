import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { useQuiz, useCreateQuiz, useUpdateQuiz } from "@/hooks/use-quizzes";
import { useCourses } from "@/hooks/use-courses";
import { useTopics, useTopicsByCourse } from "@/hooks/use-topics";
import { useLessons, useLessonsByTopic } from "@/hooks/use-lessons";
import { useFreeCourses, useFreeCourse } from "@/hooks/use-free-courses";
import { QuestionBuilder } from "@/components/quiz/question-builder";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import type { Question, QuizType } from "@/types/api";

const quizSchema = z
  .object({
    title_en: z.string().min(2, "Title must be at least 2 characters"),
    title_ar: z.string().optional(),
    title_he: z.string().optional(),
    description_en: z.string().optional(),
    description_ar: z.string().optional(),
    description_he: z.string().optional(),
    quizType: z.enum(["course", "topic", "lesson", "freeCourse", "section"], {
      required_error: "Please select a quiz type",
    }),
    // Parent selection fields for cascading
    selectedCourseId: z.string().optional(),
    selectedTopicId: z.string().optional(),
    selectedFreeCourseId: z.string().optional(),
    // Final entity selection
    entityId: z.string().optional(),
    passingScore: z.number().min(0).max(100),
    timeLimit: z.number().min(1).max(300).optional(),
    maxAttempts: z.number().min(1).max(10).optional(),
    showCorrectAnswers: z.boolean(),
    shuffleQuestions: z.boolean(),
    shuffleOptions: z.boolean(),
  })
  .refine(
    (data) => {
      // For freeCourse, require selectedFreeCourseId
      if (data.quizType === "freeCourse") {
        return !!data.selectedFreeCourseId;
      }
      // For other types, require entityId
      return !!data.entityId;
    },
    {
      message: "Please select an entity",
      path: ["entityId"],
    }
  );

type QuizFormData = z.infer<typeof quizSchema>;

export function CreateUpdateQuiz() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [questions, setQuestions] = useState<Question[]>([]);

  const { data: quizData, isLoading: isLoadingQuiz } = useQuiz(id || "");
  const createQuizMutation = useCreateQuiz();
  const updateQuizMutation = useUpdateQuiz();

  // Fetch entities based on quiz type
  const { data: coursesData } = useCourses({ limit: 100 });
  const { data: topicsData } = useTopics({ limit: 100 });
  const { data: lessonsData } = useLessons({ limit: 100 });
  const { data: freeCoursesData } = useFreeCourses({ limit: 100 });

  const form = useForm<QuizFormData>({
    resolver: zodResolver(quizSchema),
    defaultValues: {
      title_en: "",
      title_ar: "",
      title_he: "",
      description_en: "",
      description_ar: "",
      description_he: "",
      quizType: undefined,
      selectedCourseId: "",
      selectedTopicId: "",
      selectedFreeCourseId: "",
      entityId: "",
      passingScore: 70,
      timeLimit: undefined,
      maxAttempts: undefined,
      showCorrectAnswers: true,
      shuffleQuestions: false,
      shuffleOptions: false,
    },
  });

  const quizType = form.watch("quizType");
  const selectedCourseId = form.watch("selectedCourseId");
  const selectedTopicId = form.watch("selectedTopicId");
  const selectedFreeCourseId = form.watch("selectedFreeCourseId");
  const dataTest = form.watch();
  console.log(dataTest);

  // Fetch filtered data based on parent selections
  const { data: filteredTopicsData } = useTopicsByCourse(
    selectedCourseId || "",
    { limit: 100 }
  );
  const { data: filteredLessonsData } = useLessonsByTopic(
    selectedTopicId || "",
    { limit: 100 }
  );
  const { data: selectedFreeCourseData } = useFreeCourse(
    selectedFreeCourseId || ""
  );

  // Reset selections when quizType changes
  useEffect(() => {
    if (quizType && !isEditMode) {
      form.setValue("entityId", "");
      form.setValue("selectedCourseId", "");
      form.setValue("selectedTopicId", "");
      form.setValue("selectedFreeCourseId", "");
    }
  }, [quizType, form, isEditMode]);

  // Reset child selections when parent course changes (for topic/lesson)
  useEffect(() => {
    if (
      selectedCourseId &&
      !isEditMode &&
      (quizType === "topic" || quizType === "lesson")
    ) {
      form.setValue("entityId", "");
      if (quizType === "lesson") {
        form.setValue("selectedTopicId", "");
      }
    }
  }, [selectedCourseId, form, isEditMode, quizType]);

  // Reset lesson selection when topic changes
  useEffect(() => {
    if (selectedTopicId && !isEditMode && quizType === "lesson") {
      form.setValue("entityId", "");
    }
  }, [selectedTopicId, form, isEditMode, quizType]);

  // Reset section selection when free course changes
  useEffect(() => {
    if (
      selectedFreeCourseId &&
      !isEditMode &&
      (quizType === "freeCourse" || quizType === "section")
    ) {
      form.setValue("entityId", "");
    }
  }, [selectedFreeCourseId, form, isEditMode, quizType]);

  useEffect(() => {
    if (isEditMode && quizData?.data) {
      const quiz = quizData.data;

      // Set form values
      if (typeof quiz.title === "object") {
        form.setValue("title_en", quiz.title.en);
        form.setValue("title_ar", quiz.title.ar || "");
        form.setValue("title_he", quiz.title.he || "");
      } else {
        form.setValue("title_en", quiz.title);
      }

      if (quiz.description && typeof quiz.description === "object") {
        form.setValue("description_en", quiz.description.en);
        form.setValue("description_ar", quiz.description.ar || "");
        form.setValue("description_he", quiz.description.he || "");
      }

      form.setValue("quizType", quiz.quizType);
      form.setValue("entityId", quiz.entityId);
      form.setValue("passingScore", quiz.passingScore);
      form.setValue("timeLimit", quiz.timeLimit);
      form.setValue("maxAttempts", quiz.maxAttempts);
      form.setValue("showCorrectAnswers", quiz.showCorrectAnswers);
      form.setValue("shuffleQuestions", quiz.shuffleQuestions);
      form.setValue("shuffleOptions", quiz.shuffleOptions);

      setQuestions(quiz.questions);

      // Populate parent selectors based on quiz type
      if (quiz.quizType === "topic") {
        // Find the topic to get its courseId
        const topic = topicsData?.data?.items?.find(
          (t: any) => t._id === quiz.entityId
        );
        if (topic?.courseId) {
          const courseId =
            typeof topic.courseId === "string"
              ? topic.courseId
              : topic.courseId._id;
          form.setValue("selectedCourseId", courseId);
        }
      } else if (quiz.quizType === "lesson") {
        // Find the lesson to get its topicId and courseId
        const lesson = lessonsData?.data?.items?.find(
          (l: any) => l._id === quiz.entityId
        );
        if (lesson?.topicId) {
          const topicId =
            typeof lesson.topicId === "string"
              ? lesson.topicId
              : lesson.topicId._id;
          form.setValue("selectedTopicId", topicId);

          // Also find the topic's courseId
          const topic = topicsData?.data?.items?.find(
            (t: any) => t._id === topicId
          );
          if (topic?.courseId) {
            const courseId =
              typeof topic.courseId === "string"
                ? topic.courseId
                : topic.courseId._id;
            form.setValue("selectedCourseId", courseId);
          }
        }
      } else if (quiz.quizType === "section") {
        // Find the free course that contains this section
        const freeCourse = freeCoursesData?.data?.items?.find((fc: any) =>
          fc.sections?.some((s: any) => s._id === quiz.entityId)
        );
        if (freeCourse) {
          form.setValue("selectedFreeCourseId", freeCourse._id);
        }
      }
    }
  }, [isEditMode, quizData, form, topicsData, lessonsData, freeCoursesData]);

  const onSubmit = async (data: QuizFormData) => {
    if (questions.length === 0) {
      toast.error("Please add at least one question");
      return;
    }

    // Determine the final entityId based on quiz type
    let finalEntityId = data.entityId;
    if (data.quizType === "freeCourse" && data.selectedFreeCourseId) {
      finalEntityId = data.selectedFreeCourseId;
    }

    const quizPayload = {
      title: {
        en: data.title_en,
        ar: data.title_ar,
        he: data.title_he,
      },
      description: data.description_en
        ? {
            en: data.description_en,
            ar: data.description_ar,
            he: data.description_he,
          }
        : undefined,
      quizType: data.quizType as QuizType,
      entityId: finalEntityId,
      questions,
      passingScore: data.passingScore,
      timeLimit: data.timeLimit,
      maxAttempts: data.maxAttempts,
      showCorrectAnswers: data.showCorrectAnswers,
      shuffleQuestions: data.shuffleQuestions,
      shuffleOptions: data.shuffleOptions,
    };

    try {
      if (isEditMode) {
        await updateQuizMutation.mutateAsync({ id: id!, data: quizPayload });
        toast.success("Quiz updated successfully");
      } else {
        await createQuizMutation.mutateAsync({
          ...quizPayload,
          entityId: finalEntityId || "",
        });
        toast.success("Quiz created successfully");
      }
      navigate("/dashboard/quizzes");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save quiz");
    }
  };

  const getCourseOptions = () => {
    return (
      coursesData?.data?.items?.map((course: any) => ({
        id: course._id,
        name: typeof course.name === "string" ? course.name : course.name.en,
      })) || []
    );
  };

  const getFreeCourseOptions = () => {
    return (
      freeCoursesData?.data?.items?.map((freeCourse: any) => ({
        id: freeCourse._id,
        name:
          typeof freeCourse.name === "string"
            ? freeCourse.name
            : freeCourse.name.en,
      })) || []
    );
  };

  const getTopicOptionsForCourse = () => {
    const topicsToUse = selectedCourseId ? filteredTopicsData?.data?.items : [];
    return (
      topicsToUse?.map((topic: any) => ({
        id: topic._id,
        name: typeof topic.name === "string" ? topic.name : topic.name.en,
      })) || []
    );
  };

  const getEntityOptions = () => {
    if (!quizType) return [];

    switch (quizType) {
      case "course":
        return (
          coursesData?.data?.items?.map((course: any) => ({
            id: course._id,
            name:
              typeof course.name === "string" ? course.name : course.name.en,
          })) || []
        );
      case "topic":
        // Use filtered topics by course if a course is selected
        const topicsToUse = selectedCourseId
          ? filteredTopicsData?.data?.items
          : topicsData?.data?.items;
        return (
          topicsToUse?.map((topic: any) => ({
            id: topic._id,
            name: typeof topic.name === "string" ? topic.name : topic.name.en,
          })) || []
        );
      case "lesson":
        // Use filtered lessons by topic if a topic is selected
        const lessonsToUse = selectedTopicId
          ? filteredLessonsData?.data?.items
          : lessonsData?.data?.items;
        return (
          lessonsToUse?.map((lesson: any) => ({
            id: lesson._id,
            name:
              typeof lesson.name === "string" ? lesson.name : lesson.name.en,
          })) || []
        );
      case "freeCourse":
        return (
          freeCoursesData?.data?.items?.map((freeCourse: any) => ({
            id: freeCourse._id,
            name:
              typeof freeCourse.name === "string"
                ? freeCourse.name
                : freeCourse.name.en,
          })) || []
        );
      case "section":
        // Use sections from selected free course
        const sections = selectedFreeCourseData?.data?.sections || [];
        return sections.map((section: any) => ({
          id: section._id,
          name:
            typeof section.title === "string"
              ? section.title
              : section.title.en,
        }));
      default:
        return [];
    }
  };

  if (isEditMode && isLoadingQuiz) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/dashboard/quizzes")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold">
            {isEditMode ? "Edit Quiz" : "Create New Quiz"}
          </h1>
          <p className="text-gray-500 mt-1">
            {isEditMode
              ? "Update quiz details and questions"
              : "Add a new quiz to your content"}
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="title_en"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title (English) *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter English title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="title_ar"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title (Arabic)</FormLabel>
                    <FormControl>
                      <Input placeholder="أدخل العنوان بالعربية" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="title_he"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title (Hebrew)</FormLabel>
                    <FormControl>
                      <Input placeholder="הזן כותרת בעברית" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <FormField
                control={form.control}
                name="description_en"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (English)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter English description"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description_ar"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Arabic)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="أدخل الوصف بالعربية"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description_he"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Hebrew)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="הזן תיאור בעברית"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </Card>

          {/* Quiz Configuration */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Quiz Configuration</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="quizType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quiz Type *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                      // disabled={isEditMode}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select quiz type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="course">Course</SelectItem>
                        <SelectItem value="topic">Topic</SelectItem>
                        <SelectItem value="lesson">Lesson</SelectItem>
                        <SelectItem value="freeCourse">Free Course</SelectItem>
                        <SelectItem value="section">Section</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Show course selector for topic/lesson quiz types */}
              {(quizType === "topic" || quizType === "lesson") && (
                <FormField
                  control={form.control}
                  name="selectedCourseId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select Course *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select course first" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {getCourseOptions().map((course) => (
                            <SelectItem key={course.id} value={course.id}>
                              {course.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Show topic selector for lesson quiz type */}
              {quizType === "lesson" && selectedCourseId && (
                <FormField
                  control={form.control}
                  name="selectedTopicId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select Topic *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select topic" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {getTopicOptionsForCourse().map((topic) => (
                            <SelectItem key={topic.id} value={topic.id}>
                              {topic.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Show free course selector for freeCourse/section quiz types */}
              {(quizType === "freeCourse" || quizType === "section") && (
                <FormField
                  control={form.control}
                  name="selectedFreeCourseId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select Free Course *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select free course" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {getFreeCourseOptions().map((freeCourse) => (
                            <SelectItem
                              key={freeCourse.id}
                              value={freeCourse.id}
                            >
                              {freeCourse.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Entity selection - always shown but with conditions */}
              {quizType !== "freeCourse" && (
                <FormField
                  control={form.control}
                  name="entityId"
                  render={({ field }) => {
                    let isDisabled = !quizType;
                    let placeholder = `Select ${quizType || "entity"}`;

                    // Disable if parent selections are required but not made
                    if (quizType === "topic" && !selectedCourseId) {
                      isDisabled = true;
                      placeholder = "Select course first";
                    } else if (quizType === "lesson" && !selectedTopicId) {
                      isDisabled = true;
                      placeholder = selectedCourseId
                        ? "Select topic first"
                        : "Select course and topic first";
                    } else if (
                      quizType === "section" &&
                      !selectedFreeCourseId
                    ) {
                      isDisabled = true;
                      placeholder = "Select free course first";
                    }

                    return (
                      <FormItem>
                        <FormLabel>
                          {quizType === "topic"
                            ? "Select Topic"
                            : quizType === "lesson"
                            ? "Select Lesson"
                            : quizType === "section"
                            ? "Select Section"
                            : quizType === "course"
                            ? "Select Course"
                            : "Select Entity"}{" "}
                          *
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={isDisabled}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={placeholder} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {getEntityOptions().map((entity) => (
                              <SelectItem key={entity.id} value={entity.id}>
                                {entity.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
              )}

              <FormField
                control={form.control}
                name="passingScore"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Passing Score (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      Minimum score required to pass the quiz
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="timeLimit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time Limit (minutes)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        max="300"
                        placeholder="Optional"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value ? parseFloat(value) : undefined);
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      Leave empty for no time limit
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maxAttempts"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Attempts</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        max="10"
                        placeholder="Optional"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value ? parseFloat(value) : undefined);
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      Leave empty for unlimited attempts
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator className="my-4" />

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="showCorrectAnswers"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between">
                    <div>
                      <FormLabel>Show Correct Answers</FormLabel>
                      <FormDescription>
                        Show answers after quiz completion
                      </FormDescription>
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

              <FormField
                control={form.control}
                name="shuffleQuestions"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between">
                    <div>
                      <FormLabel>Shuffle Questions</FormLabel>
                      <FormDescription>
                        Randomize question order
                      </FormDescription>
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

              <FormField
                control={form.control}
                name="shuffleOptions"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between">
                    <div>
                      <FormLabel>Shuffle Options</FormLabel>
                      <FormDescription>Randomize option order</FormDescription>
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
            </div>
          </Card>

          {/* Questions */}
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Questions</h2>
              <span className="text-sm text-gray-500">
                {questions.length} question{questions.length !== 1 ? "s" : ""}
              </span>
            </div>
            <QuestionBuilder questions={questions} onChange={setQuestions} />
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/dashboard/quizzes")}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                createQuizMutation.isPending || updateQuizMutation.isPending
              }
            >
              {isEditMode ? "Update Quiz" : "Create Quiz"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
