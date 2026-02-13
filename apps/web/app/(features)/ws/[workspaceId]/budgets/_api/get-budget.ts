import { fetcher } from "@/_commons/api";
import { BudgetSchema } from "./budget.types";

export interface GetBudgetParams {
  workspaceId: string;
  budgetId: string;
}

export async function getBudget({ workspaceId, budgetId }: GetBudgetParams) {
  return fetcher(`/ws/${workspaceId}/budgets/${budgetId}`, {
    method: "GET",
    schema: BudgetSchema,
  });
}
