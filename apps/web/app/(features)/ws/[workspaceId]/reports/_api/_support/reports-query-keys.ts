export const REPORTS_QUERY_KEYS = {
  expensesBreakdown: "reports-expenses-breakdown",
} as const;

export type ReportsQueryKey = (typeof REPORTS_QUERY_KEYS)[keyof typeof REPORTS_QUERY_KEYS];
