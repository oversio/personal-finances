import { fetcher, listOf } from "@/_commons/api";
import {
  RecurringTransactionSchema,
  type RecurringTransactionFilters,
} from "../recurring-transaction.types";

export interface GetRecurringTransactionListParams {
  workspaceId: string;
  filters?: RecurringTransactionFilters;
}

export async function getRecurringTransactionList({
  workspaceId,
  filters,
}: GetRecurringTransactionListParams) {
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
