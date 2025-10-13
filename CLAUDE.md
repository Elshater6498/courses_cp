# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a course management dashboard built with React, TypeScript, and Vite. The application allows administrators to manage courses, lessons, topics, users, universities, faculties, enrollments, and video libraries. It features role-based access control (RBAC) with granular permissions.

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run linter
npm run lint

# Preview production build
npm run preview
```

## Architecture

### Frontend Stack
- **React 18** with TypeScript
- **React Router v7** for routing
- **TanStack Query (React Query)** for server state management
- **Zustand** for client state (auth state)
- **Tailwind CSS v4** with Radix UI components
- **Axios** for HTTP requests
- **React Hook Form** with Zod validation
- **Vite** as build tool

### Key Architectural Patterns

#### 1. API Layer (`src/services/`)
All backend communication is centralized in service files that use generic API functions from `src/services/api.ts`:
- `apiGet<T>` - GET requests
- `apiPost<T>` - POST requests
- `apiPut<T>` - PUT requests
- `apiPatch<T>` - PATCH requests
- `apiDelete<T>` - DELETE requests
- `apiGetPaginated<T>` - GET requests with pagination

The API instance includes interceptors that:
- Automatically attach JWT tokens from localStorage (`admin_token`)
- Handle 401 errors by clearing auth and redirecting to login
- Can be configured with custom token expiration handlers

**API Base URL**: The API endpoint is configured in `src/services/api.ts` (line 10-12). Default is `https://courses-api.alef-team.com/api/v1/` with a commented local fallback.

#### 2. React Query Integration (`src/hooks/`)
Each entity has a corresponding custom hook file that provides:
- **Query keys** following a hierarchical structure (e.g., `courseKeys.all`, `courseKeys.lists()`, `courseKeys.detail(id)`)
- **Query hooks** for fetching data (e.g., `useCourses()`, `useCourse(id)`)
- **Mutation hooks** for data modifications with automatic cache invalidation (e.g., `useCreateCourse()`, `useUpdateCourse()`)

The global QueryClient configuration is in `src/lib/queryClient.ts` with:
- 3 retry attempts with exponential backoff
- 5-minute stale time
- 10-minute garbage collection time
- No refetch on window focus

#### 3. Authentication & Authorization (`src/stores/auth-store.ts`)
Zustand store with persistence middleware manages:
- Admin profile, JWT token, authentication state
- Login/logout actions
- Permission checking utilities: `hasPermission()`, `hasAnyPermission()`, `hasRole()`
- Token initialization and validation on app startup

Auth state is initialized in `src/main.tsx` via an `AuthInitializer` component.

#### 4. Routing & Protected Routes (`src/App.tsx`)
Two route wrapper components:
- `ProtectedRoute` - Redirects to login if not authenticated
- `AuthRoute` - Redirects to dashboard if already authenticated

All dashboard routes are nested under `/dashboard` with a `DashboardLayout` wrapper.

#### 5. File Upload System (`src/services/upload-service.ts`)
Implements presigned S3 URL workflow:
1. Request presigned URL from backend with file metadata
2. Upload directly to S3 using XMLHttpRequest for progress tracking
3. Return download URL and S3 key

Utility methods handle file type detection, byte/time formatting, and progress callbacks.

## Data Model Hierarchy

**Course Management Structure:**
```
Course
  ├── Topics (ordered, can have discount/price)
  │    └── Lessons (ordered, has recordings)
  │         └── Attached Files
  ├── Course Files
  └── Enrollments (full course or individual topics)
```

**User Management Structure:**
```
University
  └── Faculty (has academic year count)
       └── Users (students with semester/year)
            └── Enrollments
```

**Admin & Permissions:**
```
Role (collection of permissions)
  └── Admin (has one role)
      └── Permissions (action_resource format)
```

## Multilingual Data

Many entities support multilingual names/descriptions with this structure:
```typescript
{
  en: string;
  ar?: string;
  he?: string;
}
```

Supported entities: Universities, Faculties, Courses (name, aboutCourse, whatWillYouLearn), Topics, Lessons

**Important**: The API may return multilingual objects OR simple strings depending on the endpoint. Type definitions accommodate both.

## Type System (`src/types/api.ts`)

All API types are centrally defined here, including:
- Generic response wrappers: `ApiResponse<T>`, `PaginatedResponse<T>`
- Domain models with corresponding `Create*Input` and `Update*Input` types
- Pagination and filtering types

## Common Patterns

### Creating CRUD Pages
1. Define service functions in `src/services/[entity]-service.ts`
2. Create React Query hooks in `src/hooks/use-[entity].ts`
3. Build page component in `src/pages/[entity]-page.tsx`
4. Add route in `src/App.tsx`
5. Add navigation item in `src/components/layout/dashboard-layout.tsx` (lines 40-90) with permission check

### Implementing Permission Checks
```typescript
const { hasPermission, hasAnyPermission } = useAuthStore();

// Single permission
if (hasPermission('create_courses')) { ... }

// Any of multiple permissions
if (hasAnyPermission(['create_courses', 'update_courses'])) { ... }
```

Navigation items are filtered based on permissions in `DashboardLayout` (line 100-104).

### Form Validation
Use React Hook Form with Zod schemas and Radix UI form components from `src/components/ui/form.tsx`.

### State Management Strategy
- **Server state**: TanStack Query (caching, synchronization)
- **Client state**: React hooks (local UI state)
- **Global state**: Zustand (auth only)

## UI Components

All UI components are in `src/components/ui/` and built with Radix UI primitives + Tailwind CSS. Notable components:
- `RichTextEditor.tsx` - React Quill integration
- `multiple-selector.tsx` - Multi-select with checkboxes
- `upload-progress.tsx` - File upload progress display
- Custom form components with proper error handling

Component configuration is in `components.json` with path alias `@` pointing to `src/`.

## Path Aliases

TypeScript and Vite are configured with `@/*` alias mapping to `src/*` (see `tsconfig.json` and `vite.config.ts`).

## Quiz System

The quiz system allows admins to create and manage quizzes that can be attached to courses, topics, or lessons.

### Quiz Architecture

**Quiz Types**:
- `course` - Quiz attached to an entire course
- `topic` - Quiz attached to a specific topic
- `lesson` - Quiz attached to a specific lesson
- `freeCourse` - Quiz attached to a free course
- `section` - Quiz attached to a section within a free course

**Key Components**:

1. **QuizzesPage** (`src/pages/quizzes-page.tsx`):
   - Lists all quizzes with pagination and filtering
   - Supports filtering by quiz type, status, and search
   - CRUD operations with permission-based access

2. **CreateUpdateQuiz** (`src/pages/quiz/create-update-quiz.tsx`):
   - Form for creating/editing quizzes
   - Multilingual support for titles, descriptions, questions, and options
   - Dynamic entity selection based on quiz type
   - Configurable settings: passing score, time limit, max attempts, shuffling

3. **QuestionBuilder** (`src/components/quiz/question-builder.tsx`):
   - Interactive question and option management
   - Drag-and-drop question reordering
   - Multiple choice questions (MCQ) with 2-6 options per question
   - Support for multiple correct answers per question
   - Optional explanations for each question

**Quiz Configuration Options**:
- **passingScore**: Percentage required to pass (0-100)
- **timeLimit**: Optional time limit in minutes (1-300)
- **maxAttempts**: Optional maximum attempts per user (1-10)
- **showCorrectAnswers**: Whether to show correct answers after completion
- **shuffleQuestions**: Randomize question order for each attempt
- **shuffleOptions**: Randomize option order for each attempt

**Data Structure**:
```typescript
Quiz
  ├── title (multilingual)
  ├── description (multilingual, optional)
  ├── quizType (course|topic|lesson|freeCourse|section)
  ├── entityId (references the attached entity)
  ├── questions[]
  │    ├── question (multilingual)
  │    ├── type (mcq)
  │    ├── options[] (2-6 options)
  │    │    ├── text (multilingual)
  │    │    ├── isCorrect (boolean)
  │    │    └── order (number)
  │    ├── explanation (multilingual, optional)
  │    ├── points (1-100)
  │    └── order (number)
  ├── totalPoints (auto-calculated)
  ├── passingScore (percentage)
  ├── timeLimit (optional, minutes)
  ├── maxAttempts (optional)
  └── configuration flags
```

**Services & Hooks**:
- `src/services/quiz-service.ts` - API communication layer
- `src/hooks/use-quizzes.ts` - React Query hooks for state management

**Permissions Required**:
- `read_quizzes` - View quizzes
- `create_quizzes` - Create new quizzes
- `update_quizzes` - Edit existing quizzes
- `delete_quizzes` - Delete quizzes

## Important Notes

- Video URLs in courses and lessons are stored as S3 keys, not full URLs
- The backend API returns nested response structures that `apiGetPaginated` automatically flattens (see lines 123-134 in `src/services/api.ts`)
- Enrollments support both full course access and individual topic purchases
- Course pricing includes discount calculations at course, topic levels
- Users are scoped to university/faculty with academic year and semester tracking
- Devices are tracked per user for multi-device login management
- Quizzes can be attached to courses, topics, or lessons with multilingual support
