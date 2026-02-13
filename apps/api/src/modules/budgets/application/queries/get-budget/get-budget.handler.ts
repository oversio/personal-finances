import { Inject, Injectable } from "@nestjs/common";
import {
  CATEGORY_REPOSITORY,
  type CategoryRepository,
} from "@/modules/categories/application/ports";
import { Budget, type BudgetProgress } from "../../../domain/entities";
import { BudgetNotFoundError } from "../../../domain/exceptions";
import { BUDGET_REPOSITORY, type BudgetRepository } from "../../ports";
import { BudgetProgressService } from "../../services";
import { GetBudgetQuery } from "./get-budget.query";

interface CategoryInfo {
  id: string;
  name: string;
  type: string;
}

interface SubcategoryInfo {
  id: string;
  name: string;
}

export type GetBudgetResult = ReturnType<Budget["toPrimitives"]> &
  BudgetProgress & {
    category: CategoryInfo;
    subcategory?: SubcategoryInfo;
  };

@Injectable()
export class GetBudgetHandler {
  constructor(
    @Inject(BUDGET_REPOSITORY)
    private readonly budgetRepository: BudgetRepository,
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: CategoryRepository,
    private readonly budgetProgressService: BudgetProgressService,
  ) {}

  async execute(query: GetBudgetQuery): Promise<GetBudgetResult> {
    const budget = await this.budgetRepository.findById(query.id);

    if (!budget || budget.workspaceId.value !== query.workspaceId) {
      throw new BudgetNotFoundError(query.id);
    }

    const progress = await this.budgetProgressService.calculateProgress(budget);

    // Fetch category info
    const category = await this.categoryRepository.findById(budget.categoryId.value);

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

    return {
      ...budget.toPrimitives(),
      ...progress,
      category: categoryInfo,
      subcategory: subcategoryInfo,
    };
  }
}
