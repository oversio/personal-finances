"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BUDGET_QUERY_KEYS } from "../_support/budget-query-keys";
import { createBudget } from "./create-budget";

export function useCreateBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [BUDGET_QUERY_KEYS.create],
    mutationFn: createBudget,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [BUDGET_QUERY_KEYS.list, variables.workspaceId],
      });
    },
  });
}
