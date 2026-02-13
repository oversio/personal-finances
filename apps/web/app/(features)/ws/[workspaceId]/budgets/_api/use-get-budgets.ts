"use client";

import { useQuery } from "@tanstack/react-query";
import { BUDGET_QUERY_KEYS } from "./_support/budget-query-keys";
import { getBudgets, type GetBudgetsParams } from "./get-budgets";

export function useGetBudgets(params: GetBudgetsParams) {
  return useQuery({
    queryKey: [BUDGET_QUERY_KEYS.list, params.workspaceId, params.includeArchived],
    queryFn: () => getBudgets(params),
    enabled: !!params.workspaceId,
  });
}
