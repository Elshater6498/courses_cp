import axios, { AxiosError } from "axios"

interface BackendValidationError {
  type?: string
  value?: string
  msg: string
  path?: string
  location?: string
}

interface BackendErrorResponse {
  success: boolean
  message: string
  errors?: BackendValidationError[]
  error?: string
}

/**
 * Extracts user-friendly error messages from axios errors
 * @param error - The caught error object
 * @param fallbackMessage - Default message if extraction fails
 * @returns User-friendly error message
 */
export function getErrorMessage(
  error: unknown,
  fallbackMessage = "An error occurred"
): string {
  // Check if it's an AxiosError
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<BackendErrorResponse>

    // Extract backend error response
    const errorData = axiosError.response?.data

    if (errorData) {
      // Handle validation errors (array of errors with msg field)
      if (errorData.errors && Array.isArray(errorData.errors)) {
        // Get all error messages from the errors array
        const errorMessages = errorData.errors
          .map((err) => err.msg)
          .filter(Boolean)

        if (errorMessages.length > 0) {
          // Return all error messages joined with line breaks
          return errorMessages.join(", ")
        }
      }

      // Handle general error message
      if (errorData.message) {
        return errorData.message
      }

      // Handle error field (alternative error message field)
      if (errorData.error) {
        return errorData.error
      }
    }

    // Fallback to axios error message if available
    if (axiosError.message) {
      return axiosError.message
    }
  }

  // Handle generic Error instances
  if (error instanceof Error) {
    return error.message
  }

  // Final fallback
  return fallbackMessage
}
