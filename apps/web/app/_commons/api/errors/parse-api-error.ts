import { isAxiosError } from "axios";

import { ApiError } from "./api-error";
import { ApiValidationErrorsSchema } from "./api-validation-errors-schema";
import { ValidationErrors } from "./validation-errors";

/**
 * Parses an API error from an axios error response.
 *
 * - 422 errors are parsed into ValidationErrors
 * - Other errors are parsed into ApiError
 *
 * @throws ValidationErrors for 422 responses
 * @throws ApiError for all other error responses
 */
export function parseApiError(error: unknown): never {
  if (isAxiosError(error) && error.response) {
    const { status, data } = error.response;

    // 422 Validation errors -> throw ValidationErrors
    if (status === 422) {
      const parsed = ApiValidationErrorsSchema.safeParse(data);
      if (parsed.success) {
        throw parsed.data;
      }
      // Fallback if parsing fails
      const fallback = new ValidationErrors();
      fallback.addGeneralError("unknown", "Validation error occurred");
      throw fallback;
    }

    // Standard errors -> throw ApiError
    throw ApiError.fromResponse(data);
  }

  // Network error or other non-axios error
  if (error instanceof Error) {
    throw new ApiError(0, "Network Error", error.message);
  }

  throw new ApiError(0, "Unknown Error", "An unexpected error occurred");
}

/**
 * Type for mutation errors that can be either ValidationErrors or ApiError.
 */
export type MutationError = ValidationErrors | ApiError;
