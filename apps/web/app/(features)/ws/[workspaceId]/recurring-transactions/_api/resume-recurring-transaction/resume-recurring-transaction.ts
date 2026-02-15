import { fetcher } from "@/_commons/api";
import { RecurringTransactionSchema } from "../recurring-transaction.types";

export interface ResumeRecurringTransactionParams {
  workspaceId: string;
  recurringTransactionId: string;
}

export async function resumeRecurringTransaction({
  workspaceId,
  recurringTransactionId,
}: ResumeRecurringTransactionParams) {
  return fetcher(`/ws/${workspaceId}/recurring-transactions/${recurringTransactionId}/resume`, {
    method: "POST",
    schema: RecurringTransactionSchema,
  });
}
