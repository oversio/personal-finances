"use client";

import { useQuery } from "@tanstack/react-query";
import { TRANSACTION_QUERY_KEYS } from "./_support/transaction-query-keys";
import { getTransaction, type GetTransactionParams } from "./get-transaction";

export function useGetTransaction(params: GetTransactionParams) {
  return useQuery({
    queryKey: [TRANSACTION_QUERY_KEYS.detail, params.workspaceId, params.transactionId],
    queryFn: () => getTransaction(params),
    enabled: !!params.workspaceId && !!params.transactionId,
  });
}
