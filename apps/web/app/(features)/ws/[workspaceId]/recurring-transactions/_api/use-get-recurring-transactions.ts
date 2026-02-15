"use client";

import { useQuery } from "@tanstack/react-query";
import { RECURRING_TRANSACTION_QUERY_KEYS } from "./_support/recurring-transaction-query-keys";
import {
  getRecurringTransactions,
  type GetRecurringTransactionsParams,
} from "./get-recurring-transactions";

export function useGetRecurringTransactions(params: GetRecurringTransactionsParams) {
  return useQuery({
    queryKey: [RECURRING_TRANSACTION_QUERY_KEYS.list, params.workspaceId, params.filters],
    queryFn: () => getRecurringTransactions(params),
    enabled: !!params.workspaceId,
  });
}
