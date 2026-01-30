/**
 * Error codes registry for API error responses.
 * Format: {module}.{entity?}.{action/state}
 *
 * These codes are used for:
 * - i18n lookup on the frontend
 * - Consistent error identification across the API
 * - Machine-readable error categorization
 */

export const ErrorCodes = {
  // Authentication errors
  auth: {
    invalidCredentials: "auth.invalid_credentials",
    emailAlreadyExists: "auth.email_already_exists",
    tokenExpired: "auth.token_expired",
    invalidRefreshToken: "auth.invalid_refresh_token",
    oauthAccountNotLinked: "auth.oauth_account_not_linked",
    passwordRequired: "auth.password_required",
  },

  // User errors
  users: {
    notFound: "users.not_found",
    alreadyExists: "users.already_exists",
    invalidEmail: "users.invalid_email",
  },

  // Workspace errors
  workspaces: {
    notFound: "workspaces.not_found",
    memberNotFound: "workspaces.member_not_found",
    userAlreadyMember: "workspaces.user_already_member",
    limitReached: "workspaces.limit_reached",
  },

  // Account errors
  accounts: {
    notFound: "accounts.not_found",
    insufficientBalance: "accounts.insufficient_balance",
    alreadyExists: "accounts.already_exists",
  },

  // Transaction errors
  transactions: {
    notFound: "transactions.not_found",
    invalidAmount: "transactions.invalid_amount",
    invalidDate: "transactions.invalid_date",
  },

  // Category errors
  categories: {
    notFound: "categories.not_found",
    inUse: "categories.in_use",
    alreadyExists: "categories.already_exists",
  },

  // Budget errors
  budgets: {
    notFound: "budgets.not_found",
    exceeded: "budgets.exceeded",
    alreadyExists: "budgets.already_exists",
  },

  // Generic entity errors
  entity: {
    notFound: "entity.not_found",
    alreadyExists: "entity.already_exists",
    invalidId: "entity.invalid_id",
  },

  // Validation errors (for Zod and generic validation)
  validation: {
    required: "validation.required",
    minLength: "validation.min_length",
    maxLength: "validation.max_length",
    invalidFormat: "validation.invalid_format",
    invalidEmail: "validation.invalid_email",
    invalidUrl: "validation.invalid_url",
    invalidUuid: "validation.invalid_uuid",
    invalidNumber: "validation.invalid_number",
    invalidDate: "validation.invalid_date",
    tooSmall: "validation.too_small",
    tooBig: "validation.too_big",
    invalidType: "validation.invalid_type",
  },
} as const;

export type ErrorCode =
  | (typeof ErrorCodes.auth)[keyof typeof ErrorCodes.auth]
  | (typeof ErrorCodes.users)[keyof typeof ErrorCodes.users]
  | (typeof ErrorCodes.workspaces)[keyof typeof ErrorCodes.workspaces]
  | (typeof ErrorCodes.accounts)[keyof typeof ErrorCodes.accounts]
  | (typeof ErrorCodes.transactions)[keyof typeof ErrorCodes.transactions]
  | (typeof ErrorCodes.categories)[keyof typeof ErrorCodes.categories]
  | (typeof ErrorCodes.budgets)[keyof typeof ErrorCodes.budgets]
  | (typeof ErrorCodes.entity)[keyof typeof ErrorCodes.entity]
  | (typeof ErrorCodes.validation)[keyof typeof ErrorCodes.validation];
