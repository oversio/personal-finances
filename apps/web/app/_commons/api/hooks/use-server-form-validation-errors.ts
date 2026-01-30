"use client";

import { useEffect } from "react";
import type { FieldValues, Path, UseFormReturn } from "react-hook-form";

import { isValidationErrors } from "../errors";
import type { MutationError } from "../errors";

/**
 * Hook to automatically apply server validation errors to a react-hook-form form.
 *
 * - Field errors are automatically set on the corresponding form fields
 * - General errors (fieldName: null) are returned for display in the UI
 *
 * @param form - The form instance from useForm()
 * @param error - The error from useMutation (mutation.error)
 * @returns General error message if present, undefined otherwise
 *
 * @example
 * function CreateAccountForm() {
 *   const form = useForm<CreateAccountInput>();
 *   const mutation = useMutation({ mutationFn: createAccount });
 *
 *   const generalError = useServerFormValidationErrors(form, mutation.error);
 *
 *   return (
 *     <form onSubmit={form.handleSubmit(data => mutation.mutate(data))}>
 *       {generalError && <Alert variant="error">{generalError}</Alert>}
 *       <Input {...form.register("name")} error={form.formState.errors.name?.message} />
 *       <Button type="submit" isLoading={mutation.isPending}>Create</Button>
 *     </form>
 *   );
 * }
 */
export function useServerFormValidationErrors<TFieldValues extends FieldValues>(
  form: UseFormReturn<TFieldValues>,
  error: MutationError | null | undefined,
): string | undefined {
  useEffect(() => {
    if (isValidationErrors(error) && error.hasFieldErrors()) {
      for (const key of error.fieldsWithErrors) {
        const fieldName = key as Path<TFieldValues>;
        form.setError(fieldName, {
          type: "server",
          message: error.fieldErrorsMessage(fieldName),
        });
      }
    }
  }, [form, error]);

  return isValidationErrors(error) && error.hasGeneralErrors
    ? error.generalErrorsMessage
    : undefined;
}
