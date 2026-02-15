import { fetcher, IgnoreResponse } from "@/_commons/api";

export interface DeleteTransactionParams {
  workspaceId: string;
  transactionId: string;
}

export async function deleteTransaction({ workspaceId, transactionId }: DeleteTransactionParams) {
  return fetcher(`/ws/${workspaceId}/transactions/${transactionId}`, {
    method: "DELETE",
    schema: IgnoreResponse,
  });
}
