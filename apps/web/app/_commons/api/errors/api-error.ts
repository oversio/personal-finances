import { z } from "zod";
import { getErrorMessage } from "@/_commons/i18n/error-messages";

/**
 * Schema matching the backend's standard error response format (non-422).
 * See: apps/api/docs/API_STANDARDS.md
 */
export const ApiStandardErrorSchema = z.object({
  statusCode: z.number(),
  timestamp: z.string(),
  path: z.string(),
  error: z.string(),
  message: z.string(),
  errorCode: z.string().optional(),
});

export type ApiStandardErrorInput = z.input<typeof ApiStandardErrorSchema>;

/**
 * Error class for standard API errors (401, 403, 404, 500, etc.)
 */
export class ApiError extends Error {
  readonly name = "ApiError";

  constructor(
    public readonly statusCode: number,
    public readonly errorType: string,
    message: string,
    public readonly path?: string,
    public readonly timestamp?: string,
    public readonly errorCode?: string,
  ) {
    super(message);
  }

  get isUnauthorized() {
    return this.statusCode === 401;
  }

  get isForbidden() {
    return this.statusCode === 403;
  }

  get isNotFound() {
    return this.statusCode === 404;
  }

  get isServerError() {
    return this.statusCode >= 500;
  }

  static fromResponse(data: unknown): ApiError {
    const parsed = ApiStandardErrorSchema.safeParse(data);

    if (parsed.success) {
      // Translate message using error code, fallback to original message
      const translatedMessage = parsed.data.errorCode
        ? getErrorMessage(parsed.data.errorCode, parsed.data.message)
        : parsed.data.message;

      return new ApiError(
        parsed.data.statusCode,
        parsed.data.error,
        translatedMessage,
        parsed.data.path,
        parsed.data.timestamp,
        parsed.data.errorCode,
      );
    }

    // Fallback for unexpected error format
    return new ApiError(500, "Error desconocido", "Ocurrió un error inesperado");
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}
