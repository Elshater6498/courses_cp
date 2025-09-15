// API Response Types
export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
  error?: string
}

export interface PaginatedResponse<T> {
  success: boolean
  message: string
  data: {
    items: T[]
    pagination: {
      currentPage: number
      totalPages: number
      totalItems: number
      itemsPerPage: number
      hasNext: boolean
      hasPrev: boolean
      nextPage: number | null
      prevPage: number | null
    }
    meta?: {
      search?: string
      filter?: Record<string, any>
    }
  }
}

// Pagination Parameters
export interface PaginationParams {
  page?: number
  limit?: number
  search?: string
  sort?: string
  isActive?: boolean
  [key: string]: any
}

// Auth Types
export interface LoginCredentials {
  email?: string
  userName?: string
  password: string
}

export interface AuthResponse {
  admin: Admin
  token: string
}

// Admin Types
export interface Admin {
  _id: string
  userName: string
  email: string
  phone?: string
  roleId: Role
  isActive: boolean
  lastLogin?: Date
  createdAt: Date
  updatedAt: Date
}

export interface CreateAdminInput {
  userName: string
  email: string
  password: string
  roleId: string
  phone?: string
}

export interface UpdateAdminInput {
  userName?: string
  email?: string
  phone?: string
  isActive?: boolean
  roleId?: string
}

// Role Types
export interface Role {
  _id: string
  name: string
  permissions: Permission[]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface CreateRoleInput {
  name: string
  permissions: string[]
}

export interface UpdateRoleInput {
  name?: string
  permissions?: string[]
  isActive?: boolean
}

// Permission Types
export interface Permission {
  _id: string
  name: string
  resource: string
  action: string
  description?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// New types for grouped permissions
export interface PermissionGroup {
  resource: string
  permissions: Permission[]
}

export interface GroupedPermissionsResponse {
  success: boolean
  message: string
  data: PermissionGroup[]
  count: number
}

export type CreatePermissionInput = Pick<
  Permission,
  "name" | "resource" | "action" | "description"
>
export type UpdatePermissionInput = Partial<
  Pick<Permission, "name" | "resource" | "action" | "description" | "isActive">
>

export type PermissionResource =
  | "admin"
  | "roles"
  | "permissions"
  | "users"
  | "faculties"
  | "universities"
  | "courses"
  | "enrollments"
  | "lessons"
  | "topics"

export type PermissionAction =
  | "create"
  | "read"
  | "update"
  | "delete"
  | "export"
  | "import"

// University Types
export interface University {
  _id: string
  name:
    | {
        en: string
        ar?: string
        he?: string
      }
    | string // Support both multilingual and simple string for display
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface CreateUniversityInput {
  name: {
    en: string
    ar?: string
    he?: string
  }
}

export interface UpdateUniversityInput {
  name?: {
    en: string
    ar?: string
    he?: string
  }
  isActive?: boolean
}

// Faculty Types
export interface Faculty {
  _id: string
  name:
    | {
        en: string
        ar?: string
        he?: string
      }
    | string // Support both multilingual and simple string for display
  universityId: University | string
  no_academic_year: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface CreateFacultyInput {
  name: {
    en: string
    ar?: string
    he?: string
  }
  universityId: string
  no_academic_year: number
}

export interface UpdateFacultyInput {
  name?: {
    en: string
    ar?: string
    he?: string
  }
  universityId?: string
  no_academic_year?: number
  isActive?: boolean
}

// User Types
export interface User {
  _id: string
  fullName: string
  email: string
  phone?: string
  universityId: University
  facultyId: Faculty
  academicYear: string
  semester: string
  enrollmentIds: string[]
  progressIds: string[]
  blocked: boolean
  emailVerified: boolean
  devices: Device[]
  lastLogin?: Date
  createdAt: Date
  updatedAt: Date
}

export interface Device {
  deviceId: string
  deviceName: string
  deviceType: "mobile" | "desktop" | "tablet"
  userAgent: string
  ipAddress: string
  isVerified: boolean
  lastUsed: Date
  createdAt: Date
}

export interface CreateUserInput {
  fullName: string
  email: string
  password: string
  universityId: string
  facultyId: string
  academicYear: string
  semester: string
  phone?: string
}

export interface UpdateUserInput {
  fullName?: string
  email?: string
  phone?: string
  universityId?: string
  facultyId?: string
  academicYear?: string
  semester?: string
}

// Course Types
export interface Course {
  _id: string
  name:
    | {
        en: string
        ar?: string
        he?: string
      }
    | string
  aboutCourse:
    | {
        en: string
        ar?: string
        he?: string
      }
    | string
  whatWillYouLearn:
    | Array<{
        en: string
        ar?: string
        he?: string
      }>
    | string[]
  numberOfCourseHours: number
  coursePrice: number
  discount: number
  facultyIds: Faculty[] | string[]
  instructorId: Admin | string
  instructorPercentage: number
  imageUrl: string
  introductoryVideoUrl: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  discountedPrice?: number
  totalLearningOutcomes?: number
}

export interface CreateCourseInput {
  name: {
    en: string
    ar?: string
    he?: string
  }
  aboutCourse: {
    en: string
    ar?: string
    he?: string
  }
  whatWillYouLearn: Array<{
    en: string
    ar?: string
    he?: string
  }>
  numberOfCourseHours: number
  coursePrice: number
  discount?: number
  facultyIds: string[]
  instructorId: string
  instructorPercentage: number
  imageUrl: string
  introductoryVideoUrl: string
}

export interface UpdateCourseInput {
  name?: {
    en: string
    ar?: string
    he?: string
  }
  aboutCourse?: {
    en: string
    ar?: string
    he?: string
  }
  whatWillYouLearn?: Array<{
    en: string
    ar?: string
    he?: string
  }>
  numberOfCourseHours?: number
  coursePrice?: number
  discount?: number
  facultyIds?: string[]
  instructorId?: string
  instructorPercentage?: number
  imageUrl?: string
  introductoryVideoUrl?: string
  isActive?: boolean
}

export interface CourseStats {
  total: number
  active: number
  inactive: number
  averagePrice: number
  averageHours: number
  totalRevenue: number
}

// Topic Types
export interface Topic {
  _id: string
  name:
    | {
        en: string
        ar?: string
        he?: string
      }
    | string
  courseId: Course | string
  topicsPrice: number
  discount: number
  order: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  discountedPrice?: number
  finalPrice?: number
  savingsAmount?: number
  hasDiscount?: boolean
}

export interface CreateTopicInput {
  name: {
    en: string
    ar?: string
    he?: string
  }
  courseId: string
  topicsPrice: number
  discount?: number
}

export interface UpdateTopicInput {
  name: {
    en: string
    ar?: string
    he?: string
  }
  courseId?: string
  topicsPrice?: number
  discount?: number
  isActive?: boolean
}

export interface TopicStats {
  total: number
  active: number
  inactive: number
  averagePrice: number
  totalWithDiscount: number
  averageDiscount: number
  totalRevenue: number
}

export interface ReorderTopicsInput {
  topicOrders: Array<{
    topicId: string
    order: number
  }>
}

// Lesson Types
export interface Lesson {
  _id: string
  name:
    | {
        en: string
        ar?: string
        he?: string
      }
    | string
  description:
    | {
        en: string
        ar?: string
        he?: string
      }
    | string
  topicId: Topic | string
  main_recording_url: string
  recording_gvo_url?: string
  recording_vvt_url?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface CreateLessonInput {
  name: {
    en: string
    ar?: string
    he?: string
  }
  description?: {
    en: string
    ar?: string
    he?: string
  }
  topicId: string
  main_recording_url: string
  recording_gvo_url?: string
  recording_vvt_url?: string
}

export interface UpdateLessonInput {
  name?: {
    en: string
    ar?: string
    he?: string
  }
  description?: {
    en: string
    ar?: string
    he?: string
  }
  topicId?: string
  main_recording_url?: string
  recording_gvo_url?: string
  recording_vvt_url?: string
  isActive?: boolean
}

export interface LessonStats {
  total: number
  active: number
  inactive: number
}

export interface ReorderLessonsInput {
  reorderData: Array<{
    lessonId: string
    newOrder: number
  }>
}

// Error Types
export interface ValidationError {
  field: string
  message: string
}

export interface ApiError {
  success: false
  message: string
  errors?: ValidationError[]
  error?: string
}

// Enrollment Types
export interface Enrollment {
  _id: string
  userId: User
  courseId: Course
  enrollmentType: 'full_course' | 'individual_topic'
  fullAccess: boolean
  purchasedTopics: Topic[]
  totalAmount: number
  discountAmount: number
  finalAmount: number
  currency: 'usd' | 'eur' | 'gbp' | 'aed'
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded' | 'cancelled'
  stripePayment?: {
    paymentIntentId: string
    amount: number
    currency: string
    status: string
    customerId?: string
    invoiceId?: string
    refundId?: string
    metadata?: Record<string, any>
    createdAt: Date
    updatedAt: Date
  }
  expiresAt?: Date
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface CreateEnrollmentInput {
  courseId: string
  fullAccess: boolean
  purchasedTopics?: string[]
  currency?: 'usd' | 'eur' | 'gbp' | 'aed'
}

export interface UpdateEnrollmentInput {
  fullAccess?: boolean
  purchasedTopics?: string[]
  totalAmount?: number
  discountAmount?: number
  finalAmount?: number
  paymentStatus?: 'pending' | 'completed' | 'failed' | 'refunded' | 'cancelled'
  isActive?: boolean
  expiresAt?: Date
}

export interface RefundRequest {
  amount?: number
}

export interface EnrollmentStats {
  totalEnrollments: number
  completedPayments: number
  pendingPayments: number
  totalRevenue: number
  fullAccessEnrollments: number
  individualTopicEnrollments: number
}

export interface EnrollmentFilters {
  status?: 'pending' | 'completed' | 'failed' | 'refunded' | 'cancelled'
  isActive?: boolean
  fullAccess?: boolean
  courseId?: string
  userId?: string
  startDate?: string
  endDate?: string
}