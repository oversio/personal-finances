import { fetcher, listOf } from "@/_commons/api";
import { TransactionSchema, type TransactionFilters } from "../transaction.types";

export interface GetTransactionListParams {
  workspaceId: string;
  filters?: TransactionFilters;
}

export async function getTransactionList({ workspaceId, filters }: GetTransactionListParams) {
  const params: Record<string, string> = {};

  if (filters?.accountId) {
    params.accountId = filters.accountId;
  }
  if (filters?.categoryId) {
    params.categoryId = filters.categoryId;
  }
  if (filters?.type) {
    params.type = filters.type;
  }
  if (filters?.startDate) {
    params.startDate = filters.startDate.toISOString();
  }
  if (filters?.endDate) {
    params.endDate = filters.endDate.toISOString();
  }
  if (filters?.includeArchived) {
    params.includeArchived = "true";
  }

  return fetcher(`/ws/${workspaceId}/transactions`, {
    method: "GET",
    params: Object.keys(params).length > 0 ? params : undefined,
    schema: listOf(TransactionSchema),
  });
}
