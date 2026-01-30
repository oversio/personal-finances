import { z } from "zod";

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
      return new ApiError(
        parsed.data.statusCode,
        parsed.data.error,
        parsed.data.message,
        parsed.data.path,
        parsed.data.timestamp,
      );
    }

    // Fallback for unexpected error format
    return new ApiError(500, "Unknown Error", "An unexpected error occurred");
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}
