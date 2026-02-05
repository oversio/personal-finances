# Error Handling

This document describes how errors from the API are handled in the web application.

## Error Types

The application handles two types of API errors:

| Error Class        | HTTP Status              | Use Case                                         |
| ------------------ | ------------------------ | ------------------------------------------------ |
| `ValidationErrors` | 422                      | Form validation errors, business rule violations |
| `ApiError`         | 401, 403, 404, 500, etc. | Auth errors, not found, server errors            |

## Error Flow

```
API Response
    │
    ▼
fetcher() → parseApiError()
    │
    ├── 422 → ValidationErrors (field errors + general errors)
    │
    └── Other → ApiError (statusCode, message)
    │
    ▼
TanStack Query (mutation.error / query.error)
    │
    ├── Forms → useServerFormValidationErrors()
    │   • Auto-applies field errors to form
    │   • Returns general error message
    │
    └── Other → Handle manually or global handler
```

## ValidationErrors (422)

Used for form validation and business rule errors. Matches the backend's Format A response.

### Backend Response Format

```json
{
  "statusCode": 422,
  "timestamp": "2024-01-30T12:00:00.000Z",
  "path": "/api/v1/auth/register",
  "errors": [
    {
      "errorCode": "auth.email_already_exists",
      "errorDescription": "A user with this email already exists",
      "fieldName": "email",
      "handler": "user"
    }
  ]
}
```

### ValidationErrors Class

Location: `app/_commons/api/errors/validation-errors.ts`

```typescript
const error = new ValidationErrors();

// Field errors (mapped to form fields)
error.addFieldError("email", "auth.email_already_exists", "Email already exists");
error.hasFieldErrors("email"); // true
error.fieldErrorsMessage("email"); // "Email already exists"
error.fieldsWithErrors; // ["email"]

// General errors (not tied to a field)
error.addGeneralError("auth.invalid_credentials", "Invalid email or password");
error.hasGeneralErrors; // true
error.generalErrorsMessage; // "Invalid email or password"
```

### Type Guard

```typescript
import { isValidationErrors } from "@/_commons/api/errors";

if (isValidationErrors(error)) {
  // error is ValidationErrors
}
```

## ApiError (Standard Errors)

Used for auth errors, not found, server errors, etc. Matches the backend's Format B response.

### Backend Response Format

```json
{
  "statusCode": 404,
  "timestamp": "2024-01-30T12:00:00.000Z",
  "path": "/api/v1/users/123",
  "error": "Not Found",
  "message": "User with id '123' not found"
}
```

### ApiError Class

Location: `app/_commons/api/errors/api-error.ts`

```typescript
const error = new ApiError(404, "Not Found", "User not found");

error.statusCode; // 404
error.errorType; // "Not Found"
error.message; // "User not found"

// Helper getters
error.isUnauthorized; // statusCode === 401
error.isForbidden; // statusCode === 403
error.isNotFound; // statusCode === 404
error.isServerError; // statusCode >= 500
```

### Type Guard

```typescript
import { isApiError } from "@/_commons/api/errors";

if (isApiError(error)) {
  if (error.isUnauthorized) {
    // Redirect to login
  }
}
```

## Handling in Forms

Use `useServerFormValidationErrors` to automatically apply server validation errors to react-hook-form:

```typescript
"use client";

import { useForm } from "react-hook-form";
import { useServerFormValidationErrors } from "@/_commons/api";
import { useCreateAccount } from "../_api/use-create-account";

function CreateAccountForm() {
  const form = useForm<CreateAccountInput>();
  const { mutate, isPending, error } = useCreateAccount();

  // Auto-applies field errors to form, returns general error message
  const generalError = useServerFormValidationErrors(form, error);

  return (
    <form onSubmit={form.handleSubmit(data => mutate(data))}>
      {/* General errors (not tied to a field) */}
      {generalError && (
        <Alert variant="error">{generalError}</Alert>
      )}

      {/* Field errors are automatically set by the hook */}
      <Input
        {...form.register("name")}
        isInvalid={!!form.formState.errors.name}
        errorMessage={form.formState.errors.name?.message}
      />

      <Button type="submit" isLoading={isPending}>
        Create
      </Button>
    </form>
  );
}
```

### How It Works

1. When `error` changes, the hook checks if it's a `ValidationErrors`
2. For each field error, it calls `form.setError(fieldName, { type: "server", message })`
3. General errors (where `fieldName` is `null`) are returned as a string

## Handling Non-Form Errors

For errors outside of forms (lists, detail pages, etc.):

```typescript
function AccountDetail({ id }: { id: string }) {
  const { data, error, isLoading } = useGetAccount(id);

  if (isLoading) return <Spinner />;

  if (error) {
    if (isApiError(error)) {
      if (error.isNotFound) {
        return <NotFound message="Account not found" />;
      }
      if (error.isUnauthorized) {
        redirect("/login");
      }
    }
    return <ErrorMessage message="Something went wrong" />;
  }

  return <AccountCard account={data} />;
}
```

## Global Error Handling (Future)

For errors that should show toast notifications or be logged globally, you can add an `onError` callback to the query client:

```typescript
// _commons/api/query-client-provider.tsx
const queryClient = new QueryClient({
  defaultOptions: {
    mutations: {
      onError: error => {
        if (isApiError(error) && error.isServerError) {
          toast.error("Server error. Please try again later.");
        }
      },
    },
  },
});
```

## Error Code Reference

See [API_STANDARDS.md](../../api/docs/API_STANDARDS.md) for the complete list of error codes.

| Code Pattern   | Example                         | Description               |
| -------------- | ------------------------------- | ------------------------- |
| `auth.*`       | `auth.invalid_credentials`      | Authentication errors     |
| `validation.*` | `validation.required`           | Generic validation errors |
| `users.*`      | `users.not_found`               | User-related errors       |
| `accounts.*`   | `accounts.insufficient_balance` | Account-related errors    |
