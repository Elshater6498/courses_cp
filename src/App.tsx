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
import { useAuthStore } from "./stores/authStore";
import { LoginPage } from "./pages/LoginPage";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import { DashboardHome } from "./pages/DashboardHome";
import { AdminsPage } from "./pages/AdminsPage";
import { UsersPage } from "./pages/UsersPage";
import { UniversitiesPage } from "./pages/UniversitiesPage";
import { FacultiesPage } from "./pages/FacultiesPage";
import { RolesPage } from "./pages/RolesPage";
import { CoursesPage } from "./pages/CoursesPage";
import { CreateCourse } from "./pages/create-course";
import { LoadingSpinner } from "./components/ui/LoadingSpinner";

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
