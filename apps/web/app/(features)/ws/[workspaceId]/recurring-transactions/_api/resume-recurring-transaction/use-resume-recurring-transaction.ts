"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { RECURRING_TRANSACTION_QUERY_KEYS } from "../_support/recurring-transaction-query-keys";
import { resumeRecurringTransaction } from "./resume-recurring-transaction";

export function useResumeRecurringTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [RECURRING_TRANSACTION_QUERY_KEYS.resume],
    mutationFn: resumeRecurringTransaction,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [RECURRING_TRANSACTION_QUERY_KEYS.list, variables.workspaceId],
      });
      queryClient.invalidateQueries({
        queryKey: [
          RECURRING_TRANSACTION_QUERY_KEYS.detail,
          variables.workspaceId,
          variables.recurringTransactionId,
        ],
      });
    },
  });
}
