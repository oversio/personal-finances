import { DomainException, ErrorCodes } from "@/modules/shared/domain/exceptions";

export class BudgetNotFoundError extends DomainException {
  constructor(id: string) {
    super(`Budget with id ${id} not found`, {
      errorCode: ErrorCodes.budgets.notFound,
      fieldName: null,
      handler: "user",
    });
  }
}

export class BudgetAlreadyExistsError extends DomainException {
  constructor(categoryId: string, subcategoryId?: string) {
    const target = subcategoryId ? `subcategory ${subcategoryId}` : `category ${categoryId}`;
    super(`An active budget already exists for ${target}`, {
      errorCode: ErrorCodes.budgets.alreadyExists,
      fieldName: subcategoryId ? "subcategoryId" : "categoryId",
      handler: "user",
    });
  }
}

export class CategoryNotFoundForBudgetError extends DomainException {
  constructor(id: string) {
    super(`Category with id ${id} not found`, {
      errorCode: ErrorCodes.categories.notFound,
      fieldName: "categoryId",
      handler: "user",
    });
  }
}

export class SubcategoryNotFoundForBudgetError extends DomainException {
  constructor(subcategoryId: string, categoryId: string) {
    super(`Subcategory ${subcategoryId} not found in category ${categoryId}`, {
      errorCode: ErrorCodes.categories.subcategoryNotFound,
      fieldName: "subcategoryId",
      handler: "user",
    });
  }
}
