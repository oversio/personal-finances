import { fetcher } from "@/_commons/api";
import {
  RecurringTransactionSchema,
  type CreateRecurringTransactionInput,
} from "./recurring-transaction.types";

export interface CreateRecurringTransactionParams {
  workspaceId: string;
  data: CreateRecurringTransactionInput;
}

export async function createRecurringTransaction({
  workspaceId,
  data,
}: CreateRecurringTransactionParams) {
  return fetcher(`/ws/${workspaceId}/recurring-transactions`, {
    method: "POST",
    body: data,
    schema: RecurringTransactionSchema,
  });
}
