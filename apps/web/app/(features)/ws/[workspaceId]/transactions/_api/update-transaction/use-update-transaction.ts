"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ACCOUNT_QUERY_KEYS } from "../../../accounts/_api/_support/account-query-keys";
import { BUDGET_QUERY_KEYS } from "../../../budgets/_api/_support/budget-query-keys";
import { REPORTS_QUERY_KEYS } from "../../../reports/_api/_support/reports-query-keys";
import { TRANSACTION_QUERY_KEYS } from "../_support/transaction-query-keys";
import { updateTransaction } from "./update-transaction";

export function useUpdateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [TRANSACTION_QUERY_KEYS.update],
    mutationFn: updateTransaction,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [TRANSACTION_QUERY_KEYS.list, variables.workspaceId],
      });
      queryClient.invalidateQueries({
        queryKey: [TRANSACTION_QUERY_KEYS.detail, variables.workspaceId, variables.transactionId],
      });
      queryClient.invalidateQueries({
        queryKey: [ACCOUNT_QUERY_KEYS.list, variables.workspaceId],
      });
      queryClient.invalidateQueries({
        queryKey: [BUDGET_QUERY_KEYS.list, variables.workspaceId],
      });
      queryClient.invalidateQueries({
        queryKey: [REPORTS_QUERY_KEYS.expensesBreakdown, variables.workspaceId],
      });
    },
  });
}
