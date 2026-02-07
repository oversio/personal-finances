export const ACCOUNT_QUERY_KEYS = {
  list: "accounts-list",
  detail: "accounts-detail",
  create: "accounts-create",
  update: "accounts-update",
  delete: "accounts-delete",
} as const;

export type AccountQueryKey = (typeof ACCOUNT_QUERY_KEYS)[keyof typeof ACCOUNT_QUERY_KEYS];
