import { Inject, Injectable } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import {
  CATEGORY_REPOSITORY,
  type CategoryRepository,
} from "@/modules/categories/application/ports";
import { Budget, type BudgetProgress } from "../../../domain/entities";
import { BudgetNotFoundError } from "../../../domain/exceptions";
import { BUDGET_REPOSITORY, type BudgetRepository } from "../../ports";
import { BudgetProgressService } from "../../services";
import { UpdateBudgetCommand } from "./update-budget.command";

interface CategoryInfo {
  id: string;
  name: string;
  type: string;
}

interface SubcategoryInfo {
  id: string;
  name: string;
}

export type UpdateBudgetResult = ReturnType<Budget["toPrimitives"]> &
  BudgetProgress & {
    category: CategoryInfo;
    subcategory?: SubcategoryInfo;
  };

@Injectable()
export class UpdateBudgetHandler {
  constructor(
    @Inject(BUDGET_REPOSITORY)
    private readonly budgetRepository: BudgetRepository,
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: CategoryRepository,
    private readonly budgetProgressService: BudgetProgressService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(command: UpdateBudgetCommand): Promise<UpdateBudgetResult> {
    const budget = await this.budgetRepository.findById(command.id);

    if (!budget || budget.workspaceId.value !== command.workspaceId) {
      throw new BudgetNotFoundError(command.id);
    }

    const updatedBudget = budget.update({
      name: command.name,
      amount: command.amount,
      period: command.period,
      alertThreshold: command.alertThreshold,
    });

    const savedBudget = await this.budgetRepository.update(updatedBudget);

    // Calculate progress
    const progress = await this.budgetProgressService.calculateProgress(savedBudget);

    // Fetch category info
    const category = await this.categoryRepository.findById(savedBudget.categoryId.value);

    const categoryInfo: CategoryInfo = category
      ? {
          id: category.id!.value,
          name: category.name.value,
          type: category.type.value,
        }
      : {
          id: savedBudget.categoryId.value,
          name: "Unknown",
          type: "expense",
        };

    let subcategoryInfo: SubcategoryInfo | undefined;
    if (savedBudget.subcategoryId && category) {
      const subcategory = category.findSubcategory(savedBudget.subcategoryId);
      if (subcategory) {
        subcategoryInfo = {
          id: subcategory.id,
          name: subcategory.name,
        };
      }
    }

    this.eventEmitter.emit("budget.updated", {
      budgetId: savedBudget.id!.value,
      workspaceId: command.workspaceId,
      name: savedBudget.name.value,
    });

    return {
      ...savedBudget.toPrimitives(),
      ...progress,
      category: categoryInfo,
      subcategory: subcategoryInfo,
    };
  }
}
