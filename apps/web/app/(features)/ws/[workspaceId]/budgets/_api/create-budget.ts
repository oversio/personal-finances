import { fetcher } from "@/_commons/api";
import { BudgetSchema, type CreateBudgetInput } from "./budget.types";

export interface CreateBudgetParams {
  workspaceId: string;
  data: CreateBudgetInput;
}

export async function createBudget({ workspaceId, data }: CreateBudgetParams) {
  return fetcher(`/ws/${workspaceId}/budgets`, {
    method: "POST",
    body: data,
    schema: BudgetSchema,
  });
}
