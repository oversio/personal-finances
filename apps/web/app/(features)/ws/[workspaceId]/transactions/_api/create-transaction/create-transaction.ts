import { fetcher } from "@/_commons/api";
import { TransactionSchema, type CreateTransactionInput } from "../transaction.types";

export interface CreateTransactionParams {
  workspaceId: string;
  data: CreateTransactionInput;
}

export async function createTransaction({ workspaceId, data }: CreateTransactionParams) {
  return fetcher(`/ws/${workspaceId}/transactions`, {
    method: "POST",
    body: data,
    schema: TransactionSchema,
  });
}
