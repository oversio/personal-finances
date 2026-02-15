import { fetcher, listOf } from "@/_commons/api";
import { BudgetSchema } from "../budget.types";

export interface GetBudgetListParams {
  workspaceId: string;
  includeArchived?: boolean;
}

export async function getBudgetList({ workspaceId, includeArchived }: GetBudgetListParams) {
  return fetcher(`/ws/${workspaceId}/budgets`, {
    method: "GET",
    params: includeArchived ? { includeArchived: "true" } : undefined,
    schema: listOf(BudgetSchema),
  });
}
