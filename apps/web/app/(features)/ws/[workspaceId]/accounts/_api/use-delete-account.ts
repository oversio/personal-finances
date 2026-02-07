"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ACCOUNT_QUERY_KEYS } from "./_support/account-query-keys";
import { deleteAccount } from "./delete-account";

export function useDeleteAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [ACCOUNT_QUERY_KEYS.delete],
    mutationFn: deleteAccount,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [ACCOUNT_QUERY_KEYS.list, variables.workspaceId],
      });
    },
  });
}
