import { fetcher, IgnoreResponse } from "@/_commons/api";

export interface DeleteRecurringTransactionParams {
  workspaceId: string;
  recurringTransactionId: string;
}

export async function deleteRecurringTransaction({
  workspaceId,
  recurringTransactionId,
}: DeleteRecurringTransactionParams) {
  return fetcher(`/ws/${workspaceId}/recurring-transactions/${recurringTransactionId}`, {
    method: "DELETE",
    schema: IgnoreResponse,
  });
}
