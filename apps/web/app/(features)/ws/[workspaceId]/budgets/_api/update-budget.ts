import { fetcher } from "@/_commons/api";
import { BudgetSchema, type UpdateBudgetInput } from "./budget.types";

export interface UpdateBudgetParams {
  workspaceId: string;
  budgetId: string;
  data: UpdateBudgetInput;
}

export async function updateBudget({ workspaceId, budgetId, data }: UpdateBudgetParams) {
  return fetcher(`/ws/${workspaceId}/budgets/${budgetId}`, {
    method: "PUT",
    body: data,
    schema: BudgetSchema,
  });
}
