import { fetcher, IgnoreResponse } from "@/_commons/api";

export interface DeleteBudgetParams {
  workspaceId: string;
  budgetId: string;
}

export async function deleteBudget({ workspaceId, budgetId }: DeleteBudgetParams) {
  return fetcher(`/ws/${workspaceId}/budgets/${budgetId}`, {
    method: "DELETE",
    schema: IgnoreResponse,
  });
}
