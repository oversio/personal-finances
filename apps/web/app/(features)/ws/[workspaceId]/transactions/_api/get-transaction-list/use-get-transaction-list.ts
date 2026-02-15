"use client";

import { useQuery } from "@tanstack/react-query";
import { TRANSACTION_QUERY_KEYS } from "../_support/transaction-query-keys";
import { getTransactionList, type GetTransactionListParams } from "./get-transaction-list";

export function useGetTransactionList(params: GetTransactionListParams) {
  return useQuery({
    queryKey: [TRANSACTION_QUERY_KEYS.list, params.workspaceId, params.filters],
    queryFn: () => getTransactionList(params),
    enabled: !!params.workspaceId,
  });
}
