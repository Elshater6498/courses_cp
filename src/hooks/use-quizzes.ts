import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { quizService } from "@/services/quiz-service";
import type {
  CreateQuizInput,
  UpdateQuizInput,
  QuizQueryParams,
} from "@/types/api";

// Query keys
export const quizKeys = {
  all: ["quizzes"] as const,
  lists: () => [...quizKeys.all, "list"] as const,
  list: (params: QuizQueryParams) => [...quizKeys.lists(), params] as const,
  details: () => [...quizKeys.all, "detail"] as const,
  detail: (id: string) => [...quizKeys.details(), id] as const,
  statistics: (id: string) => [...quizKeys.all, "statistics", id] as const,
  leaderboard: (id: string, limit: number) => [...quizKeys.all, "leaderboard", id, limit] as const,
  byEntity: (entityType: string, entityId: string) =>
    [...quizKeys.all, "entity", entityType, entityId] as const,
};

// Get all quizzes
export const useQuizzes = (params?: QuizQueryParams) => {
  return useQuery({
    queryKey: quizKeys.list(params || {}),
    queryFn: () => quizService.getQuizzes(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get quiz by ID
export const useQuiz = (id: string) => {
  return useQuery({
    queryKey: quizKeys.detail(id),
    queryFn: () => quizService.getQuizById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get quiz statistics
export const useQuizStatistics = (id: string) => {
  return useQuery({
    queryKey: quizKeys.statistics(id),
    queryFn: () => quizService.getQuizStatistics(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Get quiz leaderboard
export const useQuizLeaderboard = (id: string, limit: number = 10) => {
  return useQuery({
    queryKey: quizKeys.leaderboard(id, limit),
    queryFn: () => quizService.getQuizLeaderboard(id, limit),
    enabled: !!id,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

// Get quizzes by entity (course, topic, or lesson)
export const useQuizzesByEntity = (entityType: string, entityId: string) => {
  return useQuery({
    queryKey: quizKeys.byEntity(entityType, entityId),
    queryFn: () => quizService.getQuizzesByEntity(entityType, entityId),
    enabled: !!entityType && !!entityId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Create quiz mutation
export const useCreateQuiz = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateQuizInput) => quizService.createQuiz(data),
    onSuccess: () => {
      // Invalidate and refetch quizzes list
      queryClient.invalidateQueries({ queryKey: quizKeys.lists() });
    },
  });
};

// Update quiz mutation
export const useUpdateQuiz = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateQuizInput }) =>
      quizService.updateQuiz(id, data),
    onSuccess: (_, { id }) => {
      // Invalidate and refetch specific quiz and quizzes list
      queryClient.invalidateQueries({ queryKey: quizKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: quizKeys.lists() });
    },
  });
};

// Delete quiz mutation
export const useDeleteQuiz = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => quizService.deleteQuiz(id),
    onSuccess: () => {
      // Invalidate and refetch quizzes list
      queryClient.invalidateQueries({ queryKey: quizKeys.lists() });
    },
  });
};

// Get quizzes for select input (for free course sections)
export const useQuizzesForSelect = () => {
  return useQuery({
    queryKey: [...quizKeys.all, "select", "section"],
    queryFn: () => quizService.getQuizzes({ isActive: true, quizType: "section" }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    select: (data) => {
      // Transform the paginated response into a simple array for select options
      return data.data?.items || [];
    },
  });
};

// Duplicate quiz mutation
export const useDuplicateQuiz = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: import("@/types/api").DuplicateQuizInput }) =>
      quizService.duplicateQuiz(id, data),
    onSuccess: () => {
      // Invalidate and refetch quizzes list
      queryClient.invalidateQueries({ queryKey: quizKeys.lists() });
    },
  });
};
