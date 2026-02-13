import { Budget } from "../../domain/entities";

export const BUDGET_REPOSITORY = Symbol("BUDGET_REPOSITORY");

export interface BudgetRepository {
  save(budget: Budget): Promise<Budget>;
  findById(id: string): Promise<Budget | null>;
  findByWorkspaceId(workspaceId: string, includeArchived?: boolean): Promise<Budget[]>;
  findActiveByCategoryAndSubcategory(
    workspaceId: string,
    categoryId: string,
    subcategoryId: string | undefined,
  ): Promise<Budget | null>;
  update(budget: Budget): Promise<Budget>;
  delete(id: string): Promise<void>;
}
