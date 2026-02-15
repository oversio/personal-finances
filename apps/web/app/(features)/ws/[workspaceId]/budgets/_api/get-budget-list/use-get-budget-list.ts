"use client";

import { useQuery } from "@tanstack/react-query";
import { BUDGET_QUERY_KEYS } from "../_support/budget-query-keys";
import { getBudgetList, type GetBudgetListParams } from "./get-budget-list";

export function useGetBudgetList(params: GetBudgetListParams) {
  return useQuery({
    queryKey: [BUDGET_QUERY_KEYS.list, params.workspaceId, params.includeArchived],
    queryFn: () => getBudgetList(params),
    enabled: !!params.workspaceId,
  });
}
