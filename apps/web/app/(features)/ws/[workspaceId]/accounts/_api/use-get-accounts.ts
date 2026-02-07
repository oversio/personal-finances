"use client";

import { useQuery } from "@tanstack/react-query";
import { ACCOUNT_QUERY_KEYS } from "./_support/account-query-keys";
import { getAccounts, type GetAccountsParams } from "./get-accounts";

export function useGetAccounts(params: GetAccountsParams) {
  return useQuery({
    queryKey: [ACCOUNT_QUERY_KEYS.list, params.workspaceId, params.includeArchived],
    queryFn: () => getAccounts(params),
    enabled: !!params.workspaceId,
  });
}
