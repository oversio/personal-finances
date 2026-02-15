"use client";

import { useQuery } from "@tanstack/react-query";
import { ACCOUNT_QUERY_KEYS } from "../_support/account-query-keys";
import { getAccountList, type GetAccountListParams } from "./get-account-list";

export function useGetAccountList(params: GetAccountListParams) {
  return useQuery({
    queryKey: [ACCOUNT_QUERY_KEYS.list, params.workspaceId, params.includeArchived],
    queryFn: () => getAccountList(params),
    enabled: !!params.workspaceId,
  });
}
