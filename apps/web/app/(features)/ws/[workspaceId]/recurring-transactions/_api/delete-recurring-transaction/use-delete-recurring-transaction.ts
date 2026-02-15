"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { RECURRING_TRANSACTION_QUERY_KEYS } from "../_support/recurring-transaction-query-keys";
import { deleteRecurringTransaction } from "./delete-recurring-transaction";

export function useDeleteRecurringTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [RECURRING_TRANSACTION_QUERY_KEYS.delete],
    mutationFn: deleteRecurringTransaction,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [RECURRING_TRANSACTION_QUERY_KEYS.list, variables.workspaceId],
      });
    },
  });
}
