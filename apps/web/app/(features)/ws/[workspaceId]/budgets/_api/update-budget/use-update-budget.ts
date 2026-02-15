"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BUDGET_QUERY_KEYS } from "../_support/budget-query-keys";
import { updateBudget } from "./update-budget";

export function useUpdateBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [BUDGET_QUERY_KEYS.update],
    mutationFn: updateBudget,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [BUDGET_QUERY_KEYS.list, variables.workspaceId],
      });
      queryClient.invalidateQueries({
        queryKey: [BUDGET_QUERY_KEYS.detail, variables.workspaceId, variables.budgetId],
      });
    },
  });
}
