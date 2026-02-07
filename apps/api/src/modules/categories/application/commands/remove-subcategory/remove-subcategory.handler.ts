import { Inject, Injectable } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { Category } from "../../../domain/entities";
import { CategoryNotFoundError, SubcategoryNotFoundError } from "../../../domain/exceptions";
import { CATEGORY_REPOSITORY, type CategoryRepository } from "../../ports";
import { RemoveSubcategoryCommand } from "./remove-subcategory.command";

export type RemoveSubcategoryResult = ReturnType<Category["toPrimitives"]>;

@Injectable()
export class RemoveSubcategoryHandler {
  constructor(
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: CategoryRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(command: RemoveSubcategoryCommand): Promise<RemoveSubcategoryResult> {
    // Find the category
    const category = await this.categoryRepository.findById(command.categoryId);

    if (!category || category.workspaceId.value !== command.workspaceId) {
      throw new CategoryNotFoundError(command.categoryId);
    }

    // Check if subcategory exists
    const subcategory = category.findSubcategory(command.subcategoryId);
    if (!subcategory) {
      throw new SubcategoryNotFoundError(command.categoryId, command.subcategoryId);
    }

    // Remove subcategory
    const updatedCategory = category.removeSubcategory(command.subcategoryId);
    const savedCategory = await this.categoryRepository.update(updatedCategory);

    // Emit domain event
    this.eventEmitter.emit("subcategory.removed", {
      categoryId: command.categoryId,
      subcategoryId: command.subcategoryId,
      workspaceId: command.workspaceId,
    });

    return savedCategory.toPrimitives();
  }
}
