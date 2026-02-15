"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { RECURRING_TRANSACTION_QUERY_KEYS } from "./_support/recurring-transaction-query-keys";
import { createRecurringTransaction } from "./create-recurring-transaction";

export function useCreateRecurringTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [RECURRING_TRANSACTION_QUERY_KEYS.create],
    mutationFn: createRecurringTransaction,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [RECURRING_TRANSACTION_QUERY_KEYS.list, variables.workspaceId],
      });
    },
  });
}
