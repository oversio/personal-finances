export const BUDGET_QUERY_KEYS = {
  list: "budgets-list",
  detail: "budgets-detail",
  create: "budgets-create",
  update: "budgets-update",
  delete: "budgets-delete",
} as const;

export type BudgetQueryKey = (typeof BUDGET_QUERY_KEYS)[keyof typeof BUDGET_QUERY_KEYS];
