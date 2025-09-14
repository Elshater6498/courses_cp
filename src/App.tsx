import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { queryClient } from "./lib/queryClient";
import { useAuthStore } from "./stores/auth-store";
import { LoginPage } from "./pages/login-page";
import { DashboardLayout } from "./components/layout/dashboard-layout";
import { DashboardHome } from "./pages/dashboard-home";
import { AdminsPage } from "./pages/admins-page";
import { UsersPage } from "./pages/users-page";
import { UniversitiesPage } from "./pages/universities-page";
import { FacultiesPage } from "./pages/faculties-page";
import { RolesPage } from "./pages/roles-page";
import { CoursesPage } from "./pages/course/courses-page";
import { CreateCourse } from "./pages/course/create-update-course";
import { TopicsPage } from "./pages/course/topic/topics-page";
import { LessonsPage } from "./pages/course/lesson/lessons-page";
import { CreateUpdateLesson } from "./pages/course/lesson/create-update-lesson";
import { LoadingSpinner } from "./components/ui/loading-spinner";
import { CourseFilesPage } from "./pages/course/course-files/course-files-page";
import { TopicFilesPage } from "./pages/course/topic/topic-files-page";
import { LessonFilesPage } from "./pages/course/lesson/lesson-files-page";

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

// Auth Route Component (redirect to dashboard if already authenticated)
function AuthRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          {/* Auth Routes */}
          <Route
            path="/login"
            element={
              <AuthRoute>
                <LoginPage />
              </AuthRoute>
            }
          />

          {/* Dashboard Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardHome />} />
            <Route path="admins" element={<AdminsPage />} />
            <Route path="roles" element={<RolesPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="universities" element={<UniversitiesPage />} />
            <Route path="faculties" element={<FacultiesPage />} />
            <Route path="courses" element={<CoursesPage />} />
            <Route path="courses/new" element={<CreateCourse />} />
            <Route path="courses/:id/edit" element={<CreateCourse />} />
            <Route path="courses/:courseId/topics" element={<TopicsPage />} />
            <Route
              path="courses/:courseId/topics/:topicId/lessons"
              element={<LessonsPage />}
            />
            <Route
              path="courses/:courseId/topics/:topicId/lessons/create"
              element={<CreateUpdateLesson />}
            />
            <Route
              path="courses/:courseId/topics/:topicId/lessons/:lessonId/edit"
              element={<CreateUpdateLesson />}
            />
            <Route
              path="courses/:courseId/files"
              element={<CourseFilesPage />}
            />
            <Route
              path="courses/:courseId/topics/:topicId/files"
              element={<TopicFilesPage />}
            />
            <Route
              path="courses/:courseId/topics/:topicId/lessons/:lessonId/files"
              element={<LessonFilesPage />}
            />
          </Route>

          {/* Redirect root to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
