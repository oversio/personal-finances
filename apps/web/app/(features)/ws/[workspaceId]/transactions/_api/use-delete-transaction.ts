"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ACCOUNT_QUERY_KEYS } from "../../accounts/_api/_support/account-query-keys";
import { TRANSACTION_QUERY_KEYS } from "./_support/transaction-query-keys";
import { deleteTransaction } from "./delete-transaction";

export function useDeleteTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [TRANSACTION_QUERY_KEYS.delete],
    mutationFn: deleteTransaction,
    onSuccess: (_, variables) => {
      // Invalidate transactions list
      queryClient.invalidateQueries({
        queryKey: [TRANSACTION_QUERY_KEYS.list, variables.workspaceId],
      });
      // Invalidate accounts (balance was reversed)
      queryClient.invalidateQueries({
        queryKey: [ACCOUNT_QUERY_KEYS.list, variables.workspaceId],
      });
    },
  });
}
