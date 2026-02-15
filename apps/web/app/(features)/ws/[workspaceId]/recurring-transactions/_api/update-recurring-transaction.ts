import { fetcher } from "@/_commons/api";
import {
  RecurringTransactionSchema,
  type UpdateRecurringTransactionInput,
} from "./recurring-transaction.types";

export interface UpdateRecurringTransactionParams {
  workspaceId: string;
  recurringTransactionId: string;
  data: UpdateRecurringTransactionInput;
}

export async function updateRecurringTransaction({
  workspaceId,
  recurringTransactionId,
  data,
}: UpdateRecurringTransactionParams) {
  return fetcher(`/ws/${workspaceId}/recurring-transactions/${recurringTransactionId}`, {
    method: "PUT",
    body: data,
    schema: RecurringTransactionSchema,
  });
}
