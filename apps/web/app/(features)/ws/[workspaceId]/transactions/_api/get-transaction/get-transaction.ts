import { fetcher } from "@/_commons/api";
import { TransactionSchema } from "../transaction.types";

export interface GetTransactionParams {
  workspaceId: string;
  transactionId: string;
}

export async function getTransaction({ workspaceId, transactionId }: GetTransactionParams) {
  return fetcher(`/ws/${workspaceId}/transactions/${transactionId}`, {
    method: "GET",
    schema: TransactionSchema,
  });
}
