"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ACCOUNT_QUERY_KEYS } from "../../accounts/_api/_support/account-query-keys";
import { TRANSACTION_QUERY_KEYS } from "../../transactions/_api/_support/transaction-query-keys";
import { RECURRING_TRANSACTION_QUERY_KEYS } from "./_support/recurring-transaction-query-keys";
import { processRecurringTransactions } from "./process-recurring-transactions";

export function useProcessRecurringTransactions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [RECURRING_TRANSACTION_QUERY_KEYS.process],
    mutationFn: processRecurringTransactions,
    onSuccess: (_, variables) => {
      // Invalidate recurring transactions list (schedules advanced)
      queryClient.invalidateQueries({
        queryKey: [RECURRING_TRANSACTION_QUERY_KEYS.list, variables.workspaceId],
      });
      // Invalidate transactions list (new transactions created)
      queryClient.invalidateQueries({
        queryKey: [TRANSACTION_QUERY_KEYS.list, variables.workspaceId],
      });
      // Invalidate accounts (balances may have changed)
      queryClient.invalidateQueries({
        queryKey: [ACCOUNT_QUERY_KEYS.list, variables.workspaceId],
      });
    },
  });
}
