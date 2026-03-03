"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ACCOUNT_QUERY_KEYS } from "../../../accounts/_api/_support/account-query-keys";
import { BUDGET_QUERY_KEYS } from "../../../budgets/_api/_support/budget-query-keys";
import { CATEGORY_QUERY_KEYS } from "../../../categories/_api/_support/category-query-keys";
import { TRANSACTION_QUERY_KEYS } from "../_support/transaction-query-keys";
import { confirmImport } from "./confirm-import";

export function useConfirmImport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [TRANSACTION_QUERY_KEYS.importConfirm],
    mutationFn: confirmImport,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [TRANSACTION_QUERY_KEYS.list, variables.workspaceId],
      });
      queryClient.invalidateQueries({
        queryKey: [ACCOUNT_QUERY_KEYS.list, variables.workspaceId],
      });
      queryClient.invalidateQueries({
        queryKey: [BUDGET_QUERY_KEYS.list, variables.workspaceId],
      });
      // Invalidate category queries if categories were created
      if (data.createdCategories && data.createdCategories.length > 0) {
        queryClient.invalidateQueries({
          queryKey: [CATEGORY_QUERY_KEYS.list, variables.workspaceId],
        });
      }
    },
  });
}
