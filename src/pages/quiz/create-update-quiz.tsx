import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
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
import { toast } from "sonner";
import { useQuiz, useCreateQuiz, useUpdateQuiz } from "@/hooks/use-quizzes";
import { useCourses } from "@/hooks/use-courses";
import { useTopics } from "@/hooks/use-topics";
import { useLessons } from "@/hooks/use-lessons";
import { QuestionBuilder } from "@/components/quiz/question-builder";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import type { Question, QuizType } from "@/types/api";

const quizSchema = z.object({
  title_en: z.string().min(2, "Title must be at least 2 characters"),
  title_ar: z.string().optional(),
  title_he: z.string().optional(),
  description_en: z.string().optional(),
  description_ar: z.string().optional(),
  description_he: z.string().optional(),
  quizType: z.enum(["course", "topic", "lesson", "freeCourse", "section"]),
  entityId: z.string().min(1, "Please select an entity"),
  passingScore: z.number().min(0).max(100).default(70),
  timeLimit: z.number().min(1).max(300).optional(),
  maxAttempts: z.number().min(1).max(10).optional(),
  showCorrectAnswers: z.boolean().default(true),
  shuffleQuestions: z.boolean().default(false),
  shuffleOptions: z.boolean().default(false),
});

type QuizFormData = z.infer<typeof quizSchema>;

export function CreateUpdateQuiz() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuizType, setSelectedQuizType] = useState<QuizType | "">("");

  const { data: quizData, isLoading: isLoadingQuiz } = useQuiz(id || "");
  const createQuizMutation = useCreateQuiz();
  const updateQuizMutation = useUpdateQuiz();

  // Fetch entities based on quiz type
  const { data: coursesData } = useCourses({ limit: 1000 });
  const { data: topicsData } = useTopics({ limit: 1000 });
  const { data: lessonsData } = useLessons({ limit: 1000 });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<QuizFormData>({
    resolver: zodResolver(quizSchema),
    defaultValues: {
      passingScore: 70,
      showCorrectAnswers: true,
      shuffleQuestions: false,
      shuffleOptions: false,
    },
  });

  const quizType = watch("quizType");

  useEffect(() => {
    if (quizType) {
      setSelectedQuizType(quizType as QuizType);
      setValue("entityId", ""); // Reset entity selection when type changes
    }
  }, [quizType, setValue]);

  useEffect(() => {
    if (isEditMode && quizData?.data) {
      const quiz = quizData.data;

      // Set form values
      if (typeof quiz.title === 'object') {
        setValue("title_en", quiz.title.en);
        setValue("title_ar", quiz.title.ar || "");
        setValue("title_he", quiz.title.he || "");
      } else {
        setValue("title_en", quiz.title);
      }

      if (quiz.description && typeof quiz.description === 'object') {
        setValue("description_en", quiz.description.en);
        setValue("description_ar", quiz.description.ar || "");
        setValue("description_he", quiz.description.he || "");
      }

      setValue("quizType", quiz.quizType);
      setValue("entityId", quiz.entityId);
      setValue("passingScore", quiz.passingScore);
      setValue("timeLimit", quiz.timeLimit);
      setValue("maxAttempts", quiz.maxAttempts);
      setValue("showCorrectAnswers", quiz.showCorrectAnswers);
      setValue("shuffleQuestions", quiz.shuffleQuestions);
      setValue("shuffleOptions", quiz.shuffleOptions);

      setQuestions(quiz.questions);
      setSelectedQuizType(quiz.quizType);
    }
  }, [isEditMode, quizData, setValue]);

  const onSubmit = async (data: QuizFormData) => {
    if (questions.length === 0) {
      toast.error("Please add at least one question");
      return;
    }

    const quizData = {
      title: {
        en: data.title_en,
        ar: data.title_ar,
        he: data.title_he,
      },
      description: data.description_en ? {
        en: data.description_en,
        ar: data.description_ar,
        he: data.description_he,
      } : undefined,
      quizType: data.quizType as QuizType,
      entityId: data.entityId,
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
        await updateQuizMutation.mutateAsync({ id: id!, data: quizData });
        toast.success("Quiz updated successfully");
      } else {
        await createQuizMutation.mutateAsync(quizData);
        toast.success("Quiz created successfully");
      }
      navigate("/dashboard/quizzes");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save quiz");
    }
  };

  const getEntityOptions = () => {
    if (!selectedQuizType) return [];

    switch (selectedQuizType) {
      case "course":
        return coursesData?.data?.items?.map((course: any) => ({
          id: course._id,
          name: typeof course.name === 'string' ? course.name : course.name.en,
        })) || [];
      case "topic":
        return topicsData?.data?.items?.map((topic: any) => ({
          id: topic._id,
          name: typeof topic.name === 'string' ? topic.name : topic.name.en,
        })) || [];
      case "lesson":
        return lessonsData?.data?.items?.map((lesson: any) => ({
          id: lesson._id,
          name: typeof lesson.name === 'string' ? lesson.name : lesson.name.en,
        })) || [];
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
        <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard/quizzes")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold">
            {isEditMode ? "Edit Quiz" : "Create New Quiz"}
          </h1>
          <p className="text-gray-500 mt-1">
            {isEditMode ? "Update quiz details and questions" : "Add a new quiz to your content"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="title_en">Title (English) *</Label>
              <Input id="title_en" {...register("title_en")} />
              {errors.title_en && (
                <p className="text-sm text-red-500 mt-1">{errors.title_en.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="title_ar">Title (Arabic)</Label>
              <Input id="title_ar" {...register("title_ar")} />
            </div>
            <div>
              <Label htmlFor="title_he">Title (Hebrew)</Label>
              <Input id="title_he" {...register("title_he")} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div>
              <Label htmlFor="description_en">Description (English)</Label>
              <Textarea id="description_en" {...register("description_en")} rows={3} />
            </div>
            <div>
              <Label htmlFor="description_ar">Description (Arabic)</Label>
              <Textarea id="description_ar" {...register("description_ar")} rows={3} />
            </div>
            <div>
              <Label htmlFor="description_he">Description (Hebrew)</Label>
              <Textarea id="description_he" {...register("description_he")} rows={3} />
            </div>
          </div>
        </Card>

        {/* Quiz Configuration */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Quiz Configuration</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="quizType">Quiz Type *</Label>
              <Select
                value={watch("quizType")}
                onValueChange={(value) => setValue("quizType", value as any)}
                disabled={isEditMode}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select quiz type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="course">Course</SelectItem>
                  <SelectItem value="topic">Topic</SelectItem>
                  <SelectItem value="lesson">Lesson</SelectItem>
                  <SelectItem value="freeCourse">Free Course</SelectItem>
                  <SelectItem value="section">Section</SelectItem>
                </SelectContent>
              </Select>
              {errors.quizType && (
                <p className="text-sm text-red-500 mt-1">{errors.quizType.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="entityId">
                {selectedQuizType && `Select ${selectedQuizType}`} *
              </Label>
              <Select
                value={watch("entityId")}
                onValueChange={(value) => setValue("entityId", value)}
                disabled={!selectedQuizType || isEditMode}
              >
                <SelectTrigger>
                  <SelectValue placeholder={`Select ${selectedQuizType || 'entity'}`} />
                </SelectTrigger>
                <SelectContent>
                  {getEntityOptions().map((entity) => (
                    <SelectItem key={entity.id} value={entity.id}>
                      {entity.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.entityId && (
                <p className="text-sm text-red-500 mt-1">{errors.entityId.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="passingScore">Passing Score (%)</Label>
              <Input
                type="number"
                id="passingScore"
                {...register("passingScore", { valueAsNumber: true })}
                min="0"
                max="100"
              />
              {errors.passingScore && (
                <p className="text-sm text-red-500 mt-1">{errors.passingScore.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
              <Input
                type="number"
                id="timeLimit"
                {...register("timeLimit", { valueAsNumber: true })}
                min="1"
                max="300"
              />
            </div>

            <div>
              <Label htmlFor="maxAttempts">Max Attempts</Label>
              <Input
                type="number"
                id="maxAttempts"
                {...register("maxAttempts", { valueAsNumber: true })}
                min="1"
                max="10"
              />
            </div>
          </div>

          <Separator className="my-4" />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="showCorrectAnswers">Show Correct Answers</Label>
                <p className="text-sm text-gray-500">Show answers after quiz completion</p>
              </div>
              <Switch
                id="showCorrectAnswers"
                checked={watch("showCorrectAnswers")}
                onCheckedChange={(checked) => setValue("showCorrectAnswers", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="shuffleQuestions">Shuffle Questions</Label>
                <p className="text-sm text-gray-500">Randomize question order</p>
              </div>
              <Switch
                id="shuffleQuestions"
                checked={watch("shuffleQuestions")}
                onCheckedChange={(checked) => setValue("shuffleQuestions", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="shuffleOptions">Shuffle Options</Label>
                <p className="text-sm text-gray-500">Randomize option order</p>
              </div>
              <Switch
                id="shuffleOptions"
                checked={watch("shuffleOptions")}
                onCheckedChange={(checked) => setValue("shuffleOptions", checked)}
              />
            </div>
          </div>
        </Card>

        {/* Questions */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Questions</h2>
            <span className="text-sm text-gray-500">
              {questions.length} question{questions.length !== 1 ? 's' : ''}
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
            disabled={createQuizMutation.isPending || updateQuizMutation.isPending}
          >
            {isEditMode ? "Update Quiz" : "Create Quiz"}
          </Button>
        </div>
      </form>
    </div>
  );
}
