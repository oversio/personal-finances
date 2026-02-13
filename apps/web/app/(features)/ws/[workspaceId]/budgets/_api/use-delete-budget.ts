"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BUDGET_QUERY_KEYS } from "./_support/budget-query-keys";
import { deleteBudget } from "./delete-budget";

export function useDeleteBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [BUDGET_QUERY_KEYS.delete],
    mutationFn: deleteBudget,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [BUDGET_QUERY_KEYS.list, variables.workspaceId],
      });
    },
  });
}
