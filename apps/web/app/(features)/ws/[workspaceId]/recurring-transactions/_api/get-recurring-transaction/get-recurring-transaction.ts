import { fetcher } from "@/_commons/api";
import { RecurringTransactionSchema } from "../recurring-transaction.types";

export interface GetRecurringTransactionParams {
  workspaceId: string;
  recurringTransactionId: string;
}

export async function getRecurringTransaction({
  workspaceId,
  recurringTransactionId,
}: GetRecurringTransactionParams) {
  return fetcher(`/ws/${workspaceId}/recurring-transactions/${recurringTransactionId}`, {
    method: "GET",
    schema: RecurringTransactionSchema,
  });
}
