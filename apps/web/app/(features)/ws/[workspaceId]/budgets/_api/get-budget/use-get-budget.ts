"use client";

import { useQuery } from "@tanstack/react-query";
import { BUDGET_QUERY_KEYS } from "../_support/budget-query-keys";
import { getBudget, type GetBudgetParams } from "./get-budget";

export function useGetBudget(params: GetBudgetParams) {
  return useQuery({
    queryKey: [BUDGET_QUERY_KEYS.detail, params.workspaceId, params.budgetId],
    queryFn: () => getBudget(params),
    enabled: !!params.workspaceId && !!params.budgetId,
  });
}
