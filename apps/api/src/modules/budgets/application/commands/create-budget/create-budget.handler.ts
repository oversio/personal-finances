import { Inject, Injectable } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import {
  CATEGORY_REPOSITORY,
  type CategoryRepository,
} from "@/modules/categories/application/ports";
import { Budget, type BudgetProgress } from "../../../domain/entities";
import {
  BudgetAlreadyExistsError,
  CategoryNotFoundForBudgetError,
  SubcategoryNotFoundForBudgetError,
} from "../../../domain/exceptions";
import { BUDGET_REPOSITORY, type BudgetRepository } from "../../ports";
import { BudgetProgressService } from "../../services";
import { CreateBudgetCommand } from "./create-budget.command";

interface CategoryInfo {
  id: string;
  name: string;
  type: string;
}

interface SubcategoryInfo {
  id: string;
  name: string;
}

export type CreateBudgetResult = ReturnType<Budget["toPrimitives"]> &
  BudgetProgress & {
    category: CategoryInfo;
    subcategory?: SubcategoryInfo;
  };

@Injectable()
export class CreateBudgetHandler {
  constructor(
    @Inject(BUDGET_REPOSITORY)
    private readonly budgetRepository: BudgetRepository,
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: CategoryRepository,
    private readonly budgetProgressService: BudgetProgressService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(command: CreateBudgetCommand): Promise<CreateBudgetResult> {
    // Verify category exists and belongs to workspace
    const category = await this.categoryRepository.findById(command.categoryId);
    if (!category || category.workspaceId.value !== command.workspaceId) {
      throw new CategoryNotFoundForBudgetError(command.categoryId);
    }

    // If subcategoryId provided, verify it exists in the category
    let subcategoryInfo: SubcategoryInfo | undefined;
    if (command.subcategoryId) {
      const subcategory = category.subcategories.find(sub => sub.id === command.subcategoryId);
      if (!subcategory) {
        throw new SubcategoryNotFoundForBudgetError(command.subcategoryId, command.categoryId);
      }
      subcategoryInfo = {
        id: subcategory.id,
        name: subcategory.name,
      };
    }

    // Check if active budget already exists for this category/subcategory
    const existing = await this.budgetRepository.findActiveByCategoryAndSubcategory(
      command.workspaceId,
      command.categoryId,
      command.subcategoryId,
    );

    if (existing) {
      throw new BudgetAlreadyExistsError(command.categoryId, command.subcategoryId);
    }

    // Create the budget
    const budget = Budget.create({
      workspaceId: command.workspaceId,
      categoryId: command.categoryId,
      subcategoryId: command.subcategoryId,
      name: command.name,
      amount: command.amount,
      period: command.period,
      startDate: command.startDate,
      alertThreshold: command.alertThreshold,
    });

    const savedBudget = await this.budgetRepository.save(budget);

    // Calculate progress (will be 0 spent for new budget)
    const progress = await this.budgetProgressService.calculateProgress(savedBudget);

    // Build category info
    const categoryInfo: CategoryInfo = {
      id: category.id!.value,
      name: category.name.value,
      type: category.type.value,
    };

    this.eventEmitter.emit("budget.created", {
      budgetId: savedBudget.id!.value,
      workspaceId: command.workspaceId,
      categoryId: command.categoryId,
      subcategoryId: command.subcategoryId,
      name: command.name,
    });

    return {
      ...savedBudget.toPrimitives(),
      ...progress,
      category: categoryInfo,
      subcategory: subcategoryInfo,
    };
  }
}
