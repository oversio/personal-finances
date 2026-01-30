# API Standards

This document defines the API standards and conventions used across all endpoints.

## Table of Contents

- [API Versioning](#api-versioning)
- [Error Response Formats](#error-response-formats)
- [HTTP Status Codes](#http-status-codes)
- [Error Codes](#error-codes)
- [Pagination](#pagination)
- [Soft Delete](#soft-delete)

---

## API Versioning

All API endpoints are versioned using a URL prefix.

### URL Structure

```
/api/v1/auth/login
/api/v1/users/:id
/api/v1/accounts
/api/v1/transactions
```

### Implementation

The global prefix is set in `main.ts`:

```typescript
app.setGlobalPrefix('api/v1');
```

---

## Error Response Formats

The API uses two distinct response formats based on the HTTP status code.

### Format A: Validation Errors (422 Only)

Use the `errors` array for validation and business rule errors that can map to form fields.

```typescript
// HTTP 422 - Validation/Business Rule Errors
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
    },
    {
      "errorCode": "validation.min_length",
      "errorDescription": "Name must be at least 2 characters",
      "fieldName": "name",
      "handler": "user"
    }
  ]
}
```

#### Error Object Fields

| Field | Type | Description |
|-------|------|-------------|
| `errorCode` | `string` | Dot notation code for i18n lookup (e.g., `auth.invalid_credentials`) |
| `errorDescription` | `string` | Human-readable message (fallback if no translation) |
| `fieldName` | `string \| null` | Form field name, or `null` for general/security-sensitive errors |
| `handler` | `"user" \| "system"` | `user` = display to user, `system` = log/show generic message |

### Format B: Standard Errors (All Other Status Codes)

Simple format for non-validation errors - no field mapping needed.

```typescript
// HTTP 404 - Not Found
{
  "statusCode": 404,
  "timestamp": "2024-01-30T12:00:00.000Z",
  "path": "/api/v1/users/123",
  "error": "Not Found",
  "message": "User with id '123' not found"
}

// HTTP 401 - Unauthorized
{
  "statusCode": 401,
  "timestamp": "2024-01-30T12:00:00.000Z",
  "path": "/api/v1/accounts",
  "error": "Unauthorized",
  "message": "Invalid or expired token"
}

// HTTP 500 - Internal Server Error
{
  "statusCode": 500,
  "timestamp": "2024-01-30T12:00:00.000Z",
  "path": "/api/v1/transactions",
  "error": "Internal Server Error",
  "message": "An unexpected error occurred"
}
```

### When to Use Each Format

| Status | Format | Use Case |
|--------|--------|----------|
| 422 | Format A (errors array) | Validation errors, business rule violations, duplicate data |
| 400 | Format B | Malformed JSON, syntax errors |
| 401 | Format B | Missing/invalid/expired token |
| 403 | Format B | No permission for resource |
| 404 | Format B | Resource not found |
| 409 | Format B | Concurrent update conflict (stale data) |
| 500 | Format B | Unexpected server errors |

### Security Considerations

For login errors, use `fieldName: null` to avoid revealing whether an email exists:

```typescript
// Wrong password or non-existent email - same response
{
  "statusCode": 422,
  "errors": [{
    "errorCode": "auth.invalid_credentials",
    "errorDescription": "Invalid email or password",
    "fieldName": null,
    "handler": "user"
  }]
}
```

---

## HTTP Status Codes

| Code | Name | Usage |
|------|------|-------|
| 200 | OK | GET, PATCH success |
| 201 | Created | POST success (resource created) |
| 204 | No Content | DELETE success |
| 400 | Bad Request | Malformed JSON, syntax errors |
| 401 | Unauthorized | Missing/invalid JWT token |
| 403 | Forbidden | Valid token but no permission |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate resource, stale update |
| 422 | Unprocessable Entity | Validation errors, business rule violations |
| 500 | Internal Server Error | Unexpected server errors |

---

## Error Codes

Error codes use dot notation format: `{module}.{entity?}.{action/state}`

### Registry Location

All error codes are defined in `src/modules/shared/domain/exceptions/error-codes.ts`.

### By Module

#### Authentication (`auth`)

| Code | Description |
|------|-------------|
| `auth.invalid_credentials` | Invalid email or password |
| `auth.email_already_exists` | Email is already registered |
| `auth.token_expired` | JWT token has expired |
| `auth.invalid_refresh_token` | Refresh token is invalid or expired |
| `auth.oauth_account_not_linked` | OAuth account not linked to existing email |
| `auth.password_required` | Password required for local auth |

#### Users (`users`)

| Code | Description |
|------|-------------|
| `users.not_found` | User not found |
| `users.already_exists` | User already exists |
| `users.invalid_email` | Invalid email format |

#### Workspaces (`workspaces`)

| Code | Description |
|------|-------------|
| `workspaces.not_found` | Workspace not found |
| `workspaces.member_not_found` | Member not found in workspace |
| `workspaces.user_already_member` | User is already a member |
| `workspaces.limit_reached` | Workspace limit reached |

#### Accounts (`accounts`)

| Code | Description |
|------|-------------|
| `accounts.not_found` | Account not found |
| `accounts.insufficient_balance` | Insufficient balance for operation |
| `accounts.already_exists` | Account already exists |

#### Transactions (`transactions`)

| Code | Description |
|------|-------------|
| `transactions.not_found` | Transaction not found |
| `transactions.invalid_amount` | Invalid transaction amount |
| `transactions.invalid_date` | Invalid transaction date |

#### Categories (`categories`)

| Code | Description |
|------|-------------|
| `categories.not_found` | Category not found |
| `categories.in_use` | Category is in use and cannot be deleted |
| `categories.already_exists` | Category already exists |

#### Budgets (`budgets`)

| Code | Description |
|------|-------------|
| `budgets.not_found` | Budget not found |
| `budgets.exceeded` | Budget limit exceeded |
| `budgets.already_exists` | Budget already exists |

#### Validation (`validation`)

| Code | Description |
|------|-------------|
| `validation.required` | Field is required |
| `validation.min_length` | Value is too short |
| `validation.max_length` | Value is too long |
| `validation.invalid_format` | Invalid format |
| `validation.invalid_email` | Invalid email format |
| `validation.invalid_url` | Invalid URL format |
| `validation.invalid_uuid` | Invalid UUID format |
| `validation.invalid_number` | Invalid number |
| `validation.invalid_date` | Invalid date |
| `validation.too_small` | Value is too small |
| `validation.too_big` | Value is too big |
| `validation.invalid_type` | Invalid type |

---

## Pagination

All list endpoints support offset-based pagination.

### Request Format

```
GET /api/v1/transactions?page=1&limit=25&sortBy=createdAt&sortOrder=desc
```

### Query Parameters

| Param | Type | Default | Max | Description |
|-------|------|---------|-----|-------------|
| `page` | number | 1 | - | Page number (1-indexed) |
| `limit` | number | 25 | 100 | Items per page |
| `sortBy` | string | `createdAt` | - | Field to sort by |
| `sortOrder` | `asc \| desc` | `desc` | Sort direction |

### Response Format

```typescript
{
  "data": [...items],
  "pagination": {
    "page": 1,
    "limit": 25,
    "total": 150,
    "totalPages": 6
  }
}
```

### Implementation

Use the pagination utilities from `@/modules/shared/application/dtos`:

```typescript
import {
  PaginationQueryDto,
  createPaginatedResponse,
  getSkipValue,
  getSortObject
} from "@/modules/shared/application/dtos";

@Get()
async findAll(@Query() query: PaginationQueryDto) {
  const [items, total] = await this.repository.findWithCount({
    skip: getSkipValue(query),
    limit: query.limit,
    sort: getSortObject(query),
  });

  return createPaginatedResponse(items, total, query);
}
```

---

## Soft Delete

Soft delete is used for financial entities to maintain audit trails and allow recovery.

### Applies To

- `accounts`
- `transactions`
- `budgets`

### Implementation

Add `deletedAt` field to entity schemas:

```typescript
const AccountSchema = z.object({
  // ... other fields
  deletedAt: z.date().nullable().default(null),
});
```

### Query Behavior

- Default queries filter `deletedAt: null` to exclude deleted items
- DELETE endpoint sets `deletedAt = new Date()` and returns 204
- Data remains in database for audit/recovery purposes

### Example Repository Query

```typescript
async findAll(): Promise<Account[]> {
  return this.model.find({ deletedAt: null });
}

async softDelete(id: string): Promise<void> {
  await this.model.updateOne(
    { _id: id },
    { $set: { deletedAt: new Date() } }
  );
}
```
