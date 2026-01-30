/**
 * Handler type for error responses.
 * - "user": Display error message to the user
 * - "system": Log error, show generic message to user
 */
export type ErrorHandler = "user" | "system";

/**
 * Individual error item in a 422 validation/business error response.
 */
export interface ApiError {
  /** Dot notation code for i18n lookup (e.g., "auth.invalid_credentials") */
  errorCode: string;
  /** Human-readable message (fallback if no translation) */
  errorDescription: string;
  /** Form field name, or null for general/security-sensitive errors */
  fieldName: string | null;
  /** "user" = display to user, "system" = log/generic message */
  handler: ErrorHandler;
}

/**
 * Response format for 422 validation/business rule errors.
 * Uses errors array format for field-level error mapping.
 */
export interface ValidationErrorResponse {
  statusCode: 422;
  timestamp: string;
  path: string;
  errors: ApiError[];
}

/**
 * Response format for standard errors (401, 403, 404, 409, 500, etc.).
 * Simple format without field mapping.
 */
export interface StandardErrorResponse {
  statusCode: number;
  timestamp: string;
  path: string;
  error: string;
  message: string;
}

/**
 * Union type for all API error responses.
 */
export type ApiErrorResponse = ValidationErrorResponse | StandardErrorResponse;
