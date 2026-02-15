"use client";

import { useQuery } from "@tanstack/react-query";
import { RECURRING_TRANSACTION_QUERY_KEYS } from "../_support/recurring-transaction-query-keys";
import {
  getRecurringTransactionList,
  type GetRecurringTransactionListParams,
} from "./get-recurring-transaction-list";

export function useGetRecurringTransactionList(params: GetRecurringTransactionListParams) {
  return useQuery({
    queryKey: [RECURRING_TRANSACTION_QUERY_KEYS.list, params.workspaceId, params.filters],
    queryFn: () => getRecurringTransactionList(params),
    enabled: !!params.workspaceId,
  });
}
