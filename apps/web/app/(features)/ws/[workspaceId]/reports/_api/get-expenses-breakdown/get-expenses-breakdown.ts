import { fetcher } from "@/_commons/api";
import { ExpensesBreakdownSchema } from "../expenses-breakdown.types";

export interface GetExpensesBreakdownParams {
  workspaceId: string;
  year: number;
  currency?: string;
}

export async function getExpensesBreakdown({
  workspaceId,
  year,
  currency,
}: GetExpensesBreakdownParams) {
  const params: Record<string, string> = { year: String(year) };
  if (currency) {
    params.currency = currency;
  }

  return fetcher(`/ws/${workspaceId}/transactions/expenses-breakdown`, {
    method: "GET",
    params,
    schema: ExpensesBreakdownSchema,
  });
}
