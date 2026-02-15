import { fetcher, listOf } from "@/_commons/api";
import {
  RecurringTransactionSchema,
  type RecurringTransactionFilters,
} from "./recurring-transaction.types";

export interface GetRecurringTransactionsParams {
  workspaceId: string;
  filters?: RecurringTransactionFilters;
}

export async function getRecurringTransactions({
  workspaceId,
  filters,
}: GetRecurringTransactionsParams) {
  const params: Record<string, string> = {};

  if (filters?.type) {
    params.type = filters.type;
  }
  if (filters?.categoryId) {
    params.categoryId = filters.categoryId;
  }
  if (filters?.accountId) {
    params.accountId = filters.accountId;
  }
  if (filters?.isActive !== undefined) {
    params.isActive = String(filters.isActive);
  }
  if (filters?.includeArchived) {
    params.includeArchived = "true";
  }

  return fetcher(`/ws/${workspaceId}/recurring-transactions`, {
    method: "GET",
    params: Object.keys(params).length > 0 ? params : undefined,
    schema: listOf(RecurringTransactionSchema),
  });
}
