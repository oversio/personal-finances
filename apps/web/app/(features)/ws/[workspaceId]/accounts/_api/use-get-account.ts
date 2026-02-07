"use client";

import { useQuery } from "@tanstack/react-query";
import { ACCOUNT_QUERY_KEYS } from "./_support/account-query-keys";
import { getAccount, type GetAccountParams } from "./get-account";

export function useGetAccount(params: GetAccountParams) {
  return useQuery({
    queryKey: [ACCOUNT_QUERY_KEYS.detail, params.workspaceId, params.accountId],
    queryFn: () => getAccount(params),
    enabled: !!params.workspaceId && !!params.accountId,
  });
}
