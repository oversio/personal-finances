"use client";

import { useQuery } from "@tanstack/react-query";
import { RECURRING_TRANSACTION_QUERY_KEYS } from "../_support/recurring-transaction-query-keys";
import {
  getRecurringTransaction,
  type GetRecurringTransactionParams,
} from "./get-recurring-transaction";

export function useGetRecurringTransaction(params: GetRecurringTransactionParams) {
  return useQuery({
    queryKey: [
      RECURRING_TRANSACTION_QUERY_KEYS.detail,
      params.workspaceId,
      params.recurringTransactionId,
    ],
    queryFn: () => getRecurringTransaction(params),
    enabled: !!params.workspaceId && !!params.recurringTransactionId,
  });
}
