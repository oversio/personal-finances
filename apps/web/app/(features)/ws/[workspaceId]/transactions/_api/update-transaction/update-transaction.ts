import { fetcher } from "@/_commons/api";
import { TransactionSchema, type UpdateTransactionInput } from "../transaction.types";

export interface UpdateTransactionParams {
  workspaceId: string;
  transactionId: string;
  data: UpdateTransactionInput;
}

export async function updateTransaction({
  workspaceId,
  transactionId,
  data,
}: UpdateTransactionParams) {
  return fetcher(`/ws/${workspaceId}/transactions/${transactionId}`, {
    method: "PUT",
    body: data,
    schema: TransactionSchema,
  });
}
