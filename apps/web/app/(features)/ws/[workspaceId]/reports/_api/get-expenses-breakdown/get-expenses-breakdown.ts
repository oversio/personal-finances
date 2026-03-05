import { fetcher } from "@/_commons/api";
import { ExpensesBreakdownSchema } from "../expenses-breakdown.types";

export interface GetExpensesBreakdownParams {
  workspaceId: string;
  year: number;
}

export async function getExpensesBreakdown({ workspaceId, year }: GetExpensesBreakdownParams) {
  return fetcher(`/ws/${workspaceId}/transactions/expenses-breakdown`, {
    method: "GET",
    params: { year: String(year) },
    schema: ExpensesBreakdownSchema,
  });
}
