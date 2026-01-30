import { z } from "zod";

import { ValidationErrors } from "./validation-errors";

/**
 * Schema matching the backend's 422 error response format.
 * See: apps/api/docs/API_STANDARDS.md
 */
export const ApiValidationErrorsSchema = z
  .object({
    statusCode: z.literal(422),
    timestamp: z.string(),
    path: z.string(),
    errors: z
      .array(
        z.object({
          errorCode: z.string(),
          errorDescription: z.string(),
          fieldName: z.string().nullable(),
          handler: z.enum(["system", "user"]),
        }),
      )
      .min(1),
  })
  .transform(apiResponse => {
    const errors = new ValidationErrors();

    for (const apiError of apiResponse.errors) {
      const { fieldName, errorCode, errorDescription } = apiError;
      if (fieldName) {
        errors.addFieldError(fieldName, errorCode, errorDescription);
      } else {
        errors.addGeneralError(errorCode, errorDescription);
      }
    }

    return errors;
  });

export type ApiValidationErrorsInput = z.input<typeof ApiValidationErrorsSchema>;
