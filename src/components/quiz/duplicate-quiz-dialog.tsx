import { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Copy } from "lucide-react";
import { useDuplicateQuiz } from "@/hooks/use-quizzes";
import { useCourses } from "@/hooks/use-courses";
import { useTopics } from "@/hooks/use-topics";
import { useLessons } from "@/hooks/use-lessons";
import { useFreeCourses } from "@/hooks/use-free-courses";
import type { Quiz, QuizType } from "@/types/api";

// Form schema
const duplicateQuizSchema = z.object({
  quizType: z.enum(["course", "topic", "lesson", "freeCourse", "section"], {
    required_error: "Quiz type is required",
  }),
  entityId: z.string().min(1, "Entity is required"),
  newTitle: z
    .object({
      en: z.string().optional(),
      ar: z.string().optional(),
      he: z.string().optional(),
    })
    .optional(),
});

type DuplicateQuizFormData = z.infer<typeof duplicateQuizSchema>;

interface DuplicateQuizDialogProps {
  isOpen: boolean;
  onClose: () => void;
  quiz: Quiz | null;
}

export function DuplicateQuizDialog({
  isOpen,
  onClose,
  quiz,
}: DuplicateQuizDialogProps) {
  const [selectedQuizType, setSelectedQuizType] = useState<QuizType | "">("");
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [selectedTopic, setSelectedTopic] = useState<string>("");

  const duplicateQuizMutation = useDuplicateQuiz();

  // Fetch entities based on selected type
  const { data: coursesData } = useCourses({ isActive: true });
  const { data: topicsData } = useTopics(
    selectedCourse ? { courseId: selectedCourse, isActive: true } : undefined
  );
  const { data: lessonsData } = useLessons(
    selectedTopic ? { topicId: selectedTopic, isActive: true } : undefined
  );
  const { data: freeCoursesData } = useFreeCourses({ isActive: true });

  const form = useForm<DuplicateQuizFormData>({
    resolver: zodResolver(duplicateQuizSchema),
    defaultValues: {
      quizType: undefined,
      entityId: "",
      newTitle: {
        en: "",
        ar: "",
        he: "",
      },
    },
  });

  // Reset form when dialog closes
  useEffect(() => {
    if (!isOpen) {
      form.reset();
      setSelectedQuizType("");
      setSelectedCourse("");
      setSelectedTopic("");
    }
  }, [isOpen, form]);

  const handleSubmit = async (data: DuplicateQuizFormData) => {
    if (!quiz) return;

    try {
      const payload: any = {
        entityId: data.entityId,
      };

      if (data.quizType !== quiz.quizType) {
        payload.quizType = data.quizType;
      }

      if (
        data.newTitle?.en ||
        data.newTitle?.ar ||
        data.newTitle?.he
      ) {
        payload.newTitle = data.newTitle;
      }

      await duplicateQuizMutation.mutateAsync({
        id: quiz._id,
        data: payload,
      });

      onClose();
    } catch (error) {
      // Error is handled by the mutation hook
    }
  };

  const getEntityOptions = () => {
    const quizType = form.watch("quizType");

    switch (quizType) {
      case "course":
        return coursesData?.data?.items || [];
      case "topic":
        return topicsData?.data?.items || [];
      case "lesson":
        return lessonsData?.data?.items || [];
      case "freeCourse":
        return freeCoursesData?.data?.items || [];
      case "section":
        // For sections, we need to fetch sections from free courses
        // This is a simplified version - you may need to adjust based on your API
        return [];
      default:
        return [];
    }
  };

  const getEntityName = (entity: any) => {
    if (typeof entity.name === "string") return entity.name;
    if (typeof entity.title === "string") return entity.title;
    return entity.name?.en || entity.title?.en || "Unnamed";
  };

  const quizType = form.watch("quizType");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Copy className="h-5 w-5" />
            Duplicate Quiz
          </DialogTitle>
          <DialogDescription>
            Create a copy of this quiz and attach it to a different entity.
            {quiz && (
              <span className="block mt-2 text-sm font-medium text-foreground">
                Source Quiz: {typeof quiz.title === "string" ? quiz.title : quiz.title?.en}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Quiz Type Selection */}
            <FormField
              control={form.control}
              name="quizType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Quiz Type</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value);
                      setSelectedQuizType(value as QuizType);
                      form.setValue("entityId", "");
                      setSelectedCourse("");
                      setSelectedTopic("");
                    }}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select quiz type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="course">Course Quiz</SelectItem>
                      <SelectItem value="topic">Topic Quiz</SelectItem>
                      <SelectItem value="lesson">Lesson Quiz</SelectItem>
                      <SelectItem value="freeCourse">Free Course Quiz</SelectItem>
                      <SelectItem value="section">Section Quiz</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Course Selection (for topic and lesson) */}
            {(quizType === "topic" || quizType === "lesson") && (
              <div className="space-y-4">
                <div>
                  <FormLabel>Select Course</FormLabel>
                  <Select
                    value={selectedCourse}
                    onValueChange={(value) => {
                      setSelectedCourse(value);
                      setSelectedTopic("");
                      form.setValue("entityId", "");
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select course" />
                    </SelectTrigger>
                    <SelectContent>
                      {coursesData?.data?.items.map((course) => (
                        <SelectItem key={course._id} value={course._id}>
                          {getEntityName(course)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Topic Selection (for lesson) */}
            {quizType === "lesson" && selectedCourse && (
              <div>
                <FormLabel>Select Topic</FormLabel>
                <Select
                  value={selectedTopic}
                  onValueChange={(value) => {
                    setSelectedTopic(value);
                    form.setValue("entityId", "");
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select topic" />
                  </SelectTrigger>
                  <SelectContent>
                    {topicsData?.data?.items.map((topic) => (
                      <SelectItem key={topic._id} value={topic._id}>
                        {getEntityName(topic)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Entity Selection */}
            {quizType && quizType !== "section" && (
              <FormField
                control={form.control}
                name="entityId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Select{" "}
                      {quizType === "course"
                        ? "Course"
                        : quizType === "topic"
                        ? "Topic"
                        : quizType === "lesson"
                        ? "Lesson"
                        : "Free Course"}
                    </FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={
                        (quizType === "topic" && !selectedCourse) ||
                        (quizType === "lesson" && !selectedTopic)
                      }
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={`Select ${quizType}`} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {getEntityOptions().map((entity: any) => (
                          <SelectItem key={entity._id} value={entity._id}>
                            {getEntityName(entity)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Optional New Title */}
            <div className="space-y-4 pt-4 border-t">
              <div className="text-sm font-medium">
                Optional: Change Quiz Title
              </div>

              <FormField
                control={form.control}
                name="newTitle.en"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>English Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Leave empty to keep original" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="newTitle.ar"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Arabic Title (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Leave empty to keep original" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="newTitle.he"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hebrew Title (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Leave empty to keep original" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={duplicateQuizMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={duplicateQuizMutation.isPending}
              >
                {duplicateQuizMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Duplicate Quiz
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
