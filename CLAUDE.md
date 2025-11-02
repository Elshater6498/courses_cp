# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a course management dashboard built with React, TypeScript, and Vite. The application allows administrators to manage courses, lessons, topics, users, universities, faculties, enrollments, and video libraries. It features role-based access control (RBAC) with granular permissions.

## Development Commands

```bash
# Start development server (runs on http://localhost:5173 by default)
npm run dev

# Build for production (TypeScript check + Vite build)
npm run build

# Run linter (ESLint)
npm run lint

# Preview production build
npm run preview
```

**Development Server**: Vite dev server with Hot Module Replacement (HMR) for instant updates without full page reloads.

**Build Output**: Production build outputs to `dist/` directory with optimized bundles, code splitting, and minification.

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

**API Base URL**: The API endpoint is configured in `src/services/api.ts:12`. Currently set to `http://localhost:6060/api/v1/` with production URL (`https://courses-api.alef-team.com/api/v1/`) commented out on lines 10-11.

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

- `RichTextEditor.tsx` - React Quill integration for rich text content (used in course descriptions)
- `multiple-selector.tsx` - Multi-select with checkboxes (used for faculty selection)
- `upload-progress.tsx` - File upload progress display with speed/time estimates
- `form.tsx` - Radix UI form components with React Hook Form integration
- Custom input, button, dialog, dropdown, and table components

Component configuration is in `components.json` with:
- Style: "new-york"
- Path alias `@` pointing to `src/`
- TypeScript enabled
- Radix UI color scheme

## Video Library System

The application includes a centralized video library for managing and reusing video content across courses.

**Purpose**: Store videos once and reference them multiple times across different courses, lessons, and free course sections.

**Key Features**:

- Upload videos to centralized library
- Browse and search library videos
- Select videos from library when creating lessons or free course content
- Track video metadata: title, description, upload date
- Videos stored as S3 keys with progress tracking during upload

**Components**:

- `VideosLibraryPage` (`src/pages/videos-library-page.tsx`) - Manage library videos
- `UploadVideoDialog` (`src/components/shared/upload-video-dialog.tsx`) - Upload new videos
- Service: `src/services/videos-library-service.ts`
- Hooks: `src/hooks/use-videos-library.ts`

**Permissions**:

- `read_videos_library` - View library
- `create_videos_library` - Upload videos
- `update_videos_library` - Edit video metadata
- `delete_videos_library` - Remove videos

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

## Free Courses System

The application supports free courses in addition to paid courses. Free courses have a different structure optimized for self-paced learning.

### Free Course Architecture

**Structure Differences from Paid Courses**:

- Free courses use **Sections** (not Topics)
- Sections contain **Content Items** instead of Lessons
- Content items can be: files, videos, or quizzes
- Scoped to specific universities and faculties
- No payment/enrollment system

**Key Components**:

1. **FreeCoursesPage** (`src/pages/free-courses-page.tsx`):
   - Lists all free courses with filtering and search
   - CRUD operations with permission-based access

2. **CreateUpdateFreeCourse** (`src/pages/free-course/create-update-free-course.tsx`):
   - Form for creating/editing free courses
   - Multilingual support for name and overview
   - University/faculty assignment
   - Instructor assignment

3. **SectionBuilder** (`src/components/free-course/section-builder.tsx`):
   - Interactive section and content management
   - Drag-and-drop section reordering
   - Content items: file uploads, video library selection, quiz creation
   - Visibility toggle for sections

**Data Structure**:

```typescript
FreeCourse
  ├── name (multilingual)
  ├── overview (multilingual)
  ├── universityId (reference)
  ├── facultyId (reference)
  ├── instructorId (reference)
  ├── imageUrl
  └── Sections[]
       ├── title (multilingual)
       ├── description (multilingual, optional)
       ├── order (number)
       ├── isVisible (boolean)
       └── ContentItems[]
            ├── type (file|video|quiz)
            ├── title (multilingual)
            ├── resourceId (for videos/quizzes)
            ├── url (for files)
            └── order (number)
```

**Services & Hooks**:

- `src/services/free-course-service.ts` - API communication layer
- `src/hooks/use-free-courses.ts` - React Query hooks for state management

**Permissions Required**:

- `read_free_courses` - View free courses
- `create_free_courses` - Create new free courses
- `update_free_courses` - Edit existing free courses
- `delete_free_courses` - Delete free courses

## Payment & Enrollment System

Enrollments support Stripe payment integration with comprehensive tracking:

**Enrollment Types**:

- `full_course` - Complete course access
- `individual_topic` - Specific topic purchase
- `free_course` - Free course access (no payment)

**Payment Details** (stored in Enrollment):

- `stripePaymentIntentId` - Stripe payment intent reference
- `amount` - Payment amount
- `currency` - USD, EUR, GBP, or AED
- `paymentStatus` - pending, completed, failed, refunded, cancelled
- `paymentMethod` - card, bank_transfer, or other
- `transactionDate` - Payment timestamp
- `refundedAmount` - If partially/fully refunded

**Pricing Structure**:

- Courses have `coursePrice`, `discount`, `instructorPercentage`
- Topics can have their own `topicsPrice` and `discount`
- Final pricing calculated at course or topic level

## Cache Invalidation Strategy

React Query mutations follow a consistent cache invalidation pattern:

**Single Item Updates**:

```typescript
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: entityKeys.detail(id) })
  queryClient.invalidateQueries({ queryKey: entityKeys.lists() })
}
```

**Create/Delete Operations**:

```typescript
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: entityKeys.lists() })
  queryClient.invalidateQueries({ queryKey: entityKeys.stats() })
}
```

**Status Toggles**:

```typescript
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: entityKeys.detail(id) })
  queryClient.invalidateQueries({ queryKey: entityKeys.lists() })
  queryClient.invalidateQueries({ queryKey: entityKeys.stats() })
}
```

This ensures UI consistency across list views, detail views, and statistics.

## Error Handling & Toast Notifications

The application uses **Sonner** for toast notifications with a consistent error handling pattern:

**Success Messages**:
```typescript
toast.success('Course created successfully')
```

**Error Messages**:
```typescript
toast.error(error.response?.data?.message || 'Failed to create course')
```

**Toast Provider**: Configured in `src/main.tsx` with the `<Toaster />` component.

**API Error Format**: The backend returns errors in the format:
```typescript
{
  success: false,
  message: string,
  data?: any
}
```

Mutation hooks automatically extract and display these error messages.

## Debugging Tips

**React Query DevTools**: Not currently installed, but can be added for debugging cache and queries:
```bash
npm install @tanstack/react-query-devtools
```

**Common Issues**:

1. **401 Errors**: Token expired or invalid - check `localStorage` for `admin_token` and `auth-store`
2. **CORS Errors**: Verify API base URL matches backend CORS configuration
3. **Permission Denied**: Check admin's role permissions in auth store
4. **Nested Response Issues**: Backend may return data in `response.data.data` - verify `apiGetPaginated` handles this correctly
5. **Multilingual Fields**: Some endpoints return strings, others return objects - type system accommodates both

**Useful Browser Console Commands**:
```javascript
// Check auth state
JSON.parse(localStorage.getItem('auth-store'))

// Check token
localStorage.getItem('admin_token')

// Clear auth (logout)
localStorage.removeItem('admin_token')
localStorage.removeItem('auth-store')
```

## Important Notes

- Video URLs in courses and lessons are stored as S3 keys, not full URLs
- The backend API returns nested response structures that `apiGetPaginated` automatically flattens (see `src/services/api.ts:123-134`)
- Enrollments support both full course access and individual topic purchases
- Course pricing includes discount calculations at course and topic levels
- Users are scoped to university/faculty with academic year and semester tracking
- Devices are tracked per user for multi-device login management
- Quizzes can be attached to courses, topics, lessons, free courses, or sections with multilingual support
- Free courses use a section-based structure while paid courses use topic-based structure
