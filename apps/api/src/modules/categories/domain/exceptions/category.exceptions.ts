import { DomainException, ErrorCodes } from "@/modules/shared/domain/exceptions";

export class CategoryNotFoundError extends DomainException {
  constructor(id: string) {
    super(`Category with id ${id} not found`, {
      errorCode: ErrorCodes.categories.notFound,
      fieldName: null,
      handler: "user",
    });
  }
}

export class CategoryAlreadyExistsError extends DomainException {
  constructor(name: string) {
    super(`Category with name "${name}" already exists in this workspace`, {
      errorCode: ErrorCodes.categories.alreadyExists,
      fieldName: "name",
      handler: "user",
    });
  }
}

export class SubcategoryNotFoundError extends DomainException {
  constructor(categoryId: string, subcategoryId: string) {
    super(`Subcategory with id ${subcategoryId} not found in category ${categoryId}`, {
      errorCode: ErrorCodes.categories.subcategoryNotFound,
      fieldName: null,
      handler: "user",
    });
  }
}

export class CategoryInUseError extends DomainException {
  constructor(categoryName: string) {
    super(`Cannot archive category "${categoryName}" because it has associated transactions`, {
      errorCode: ErrorCodes.categories.inUse,
      fieldName: null,
      handler: "user",
    });
  }
}

export class SubcategoryInUseError extends DomainException {
  constructor(subcategoryName: string) {
    super(`Cannot remove subcategory "${subcategoryName}" because it has associated transactions`, {
      errorCode: ErrorCodes.categories.subcategoryInUse,
      fieldName: null,
      handler: "user",
    });
  }
}
