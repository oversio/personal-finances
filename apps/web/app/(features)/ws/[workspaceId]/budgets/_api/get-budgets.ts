import { fetcher, listOf } from "@/_commons/api";
import { BudgetSchema } from "./budget.types";

export interface GetBudgetsParams {
  workspaceId: string;
  includeArchived?: boolean;
}

export async function getBudgets({ workspaceId, includeArchived }: GetBudgetsParams) {
  return fetcher(`/ws/${workspaceId}/budgets`, {
    method: "GET",
    params: includeArchived ? { includeArchived: "true" } : undefined,
    schema: listOf(BudgetSchema),
  });
}
