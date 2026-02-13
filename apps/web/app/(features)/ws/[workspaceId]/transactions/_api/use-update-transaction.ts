"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ACCOUNT_QUERY_KEYS } from "../../accounts/_api/_support/account-query-keys";
import { TRANSACTION_QUERY_KEYS } from "./_support/transaction-query-keys";
import { updateTransaction } from "./update-transaction";

export function useUpdateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [TRANSACTION_QUERY_KEYS.update],
    mutationFn: updateTransaction,
    onSuccess: (_, variables) => {
      // Invalidate transactions list
      queryClient.invalidateQueries({
        queryKey: [TRANSACTION_QUERY_KEYS.list, variables.workspaceId],
      });
      // Invalidate transaction detail
      queryClient.invalidateQueries({
        queryKey: [TRANSACTION_QUERY_KEYS.detail, variables.workspaceId, variables.transactionId],
      });
      // Invalidate accounts (balance may have changed)
      queryClient.invalidateQueries({
        queryKey: [ACCOUNT_QUERY_KEYS.list, variables.workspaceId],
      });
    },
  });
}
