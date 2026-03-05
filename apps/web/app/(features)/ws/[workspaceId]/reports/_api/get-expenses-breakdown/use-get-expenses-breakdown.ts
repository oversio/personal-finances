"use client";

import { useQuery } from "@tanstack/react-query";
import { REPORTS_QUERY_KEYS } from "../_support/reports-query-keys";
import { getExpensesBreakdown, type GetExpensesBreakdownParams } from "./get-expenses-breakdown";

export function useGetExpensesBreakdown(params: GetExpensesBreakdownParams) {
  return useQuery({
    queryKey: [REPORTS_QUERY_KEYS.expensesBreakdown, params.workspaceId, params.year],
    queryFn: () => getExpensesBreakdown(params),
    enabled: !!params.workspaceId && !!params.year,
  });
}
