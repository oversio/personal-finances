import { Inject, Injectable } from "@nestjs/common";
import {
  CATEGORY_REPOSITORY,
  type CategoryRepository,
} from "@/modules/categories/application/ports";
import { Budget, type BudgetProgress } from "../../../domain/entities";
import { BUDGET_REPOSITORY, type BudgetRepository } from "../../ports";
import { BudgetProgressService } from "../../services";
import { GetBudgetsQuery } from "./get-budgets.query";

interface CategoryInfo {
  id: string;
  name: string;
  type: string;
}

interface SubcategoryInfo {
  id: string;
  name: string;
}

export type GetBudgetsResultItem = ReturnType<Budget["toPrimitives"]> &
  BudgetProgress & {
    category: CategoryInfo;
    subcategory?: SubcategoryInfo;
  };

export type GetBudgetsResult = GetBudgetsResultItem[];

@Injectable()
export class GetBudgetsHandler {
  constructor(
    @Inject(BUDGET_REPOSITORY)
    private readonly budgetRepository: BudgetRepository,
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: CategoryRepository,
    private readonly budgetProgressService: BudgetProgressService,
  ) {}

  async execute(query: GetBudgetsQuery): Promise<GetBudgetsResult> {
    const budgets = await this.budgetRepository.findByWorkspaceId(
      query.workspaceId,
      query.includeArchived,
    );

    // Fetch all categories for this workspace to populate category/subcategory info
    const categories = await this.categoryRepository.findByWorkspaceId(
      query.workspaceId,
      true, // Include archived to show correct info for budgets
    );

    const categoryMap = new Map(categories.map(cat => [cat.id!.value, cat]));

    // Calculate progress for each budget
    const results: GetBudgetsResult = [];

    for (const budget of budgets) {
      const progress = await this.budgetProgressService.calculateProgress(budget);
      const category = categoryMap.get(budget.categoryId.value);

      const categoryInfo: CategoryInfo = category
        ? {
            id: category.id!.value,
            name: category.name.value,
            type: category.type.value,
          }
        : {
            id: budget.categoryId.value,
            name: "Unknown",
            type: "expense",
          };

      let subcategoryInfo: SubcategoryInfo | undefined;
      if (budget.subcategoryId && category) {
        const subcategory = category.findSubcategory(budget.subcategoryId);
        if (subcategory) {
          subcategoryInfo = {
            id: subcategory.id,
            name: subcategory.name,
          };
        }
      }

      results.push({
        ...budget.toPrimitives(),
        ...progress,
        category: categoryInfo,
        subcategory: subcategoryInfo,
      });
    }

    return results;
  }
}
