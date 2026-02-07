"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ACCOUNT_QUERY_KEYS } from "./_support/account-query-keys";
import { createAccount } from "./create-account";

export function useCreateAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [ACCOUNT_QUERY_KEYS.create],
    mutationFn: createAccount,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [ACCOUNT_QUERY_KEYS.list, variables.workspaceId],
      });
    },
  });
}
