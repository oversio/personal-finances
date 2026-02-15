"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ACCOUNT_QUERY_KEYS } from "../_support/account-query-keys";
import { updateAccount } from "./update-account";

export function useUpdateAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [ACCOUNT_QUERY_KEYS.update],
    mutationFn: updateAccount,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [ACCOUNT_QUERY_KEYS.list, variables.workspaceId],
      });
      queryClient.invalidateQueries({
        queryKey: [ACCOUNT_QUERY_KEYS.detail, variables.workspaceId, variables.accountId],
      });
    },
  });
}
