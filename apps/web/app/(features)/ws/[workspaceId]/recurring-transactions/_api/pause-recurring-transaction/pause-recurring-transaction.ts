import { fetcher } from "@/_commons/api";
import { RecurringTransactionSchema } from "../recurring-transaction.types";

export interface PauseRecurringTransactionParams {
  workspaceId: string;
  recurringTransactionId: string;
}

export async function pauseRecurringTransaction({
  workspaceId,
  recurringTransactionId,
}: PauseRecurringTransactionParams) {
  return fetcher(`/ws/${workspaceId}/recurring-transactions/${recurringTransactionId}/pause`, {
    method: "POST",
    schema: RecurringTransactionSchema,
  });
}
