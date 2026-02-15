import { fetcher } from "@/_commons/api";
import { ProcessRecurringTransactionsResultSchema } from "../recurring-transaction.types";

export interface ProcessRecurringTransactionsParams {
  workspaceId: string;
}

export async function processRecurringTransactions({
  workspaceId,
}: ProcessRecurringTransactionsParams) {
  return fetcher(`/ws/${workspaceId}/recurring-transactions/process`, {
    method: "POST",
    schema: ProcessRecurringTransactionsResultSchema,
  });
}
