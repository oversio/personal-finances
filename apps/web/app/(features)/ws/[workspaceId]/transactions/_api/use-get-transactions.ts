"use client";

import { useQuery } from "@tanstack/react-query";
import { TRANSACTION_QUERY_KEYS } from "./_support/transaction-query-keys";
import { getTransactions, type GetTransactionsParams } from "./get-transactions";

export function useGetTransactions(params: GetTransactionsParams) {
  return useQuery({
    queryKey: [TRANSACTION_QUERY_KEYS.list, params.workspaceId, params.filters],
    queryFn: () => getTransactions(params),
    enabled: !!params.workspaceId,
  });
}
