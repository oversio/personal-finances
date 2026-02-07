import { Inject, Injectable } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { Category } from "../../../domain/entities";
import { CategoryNotFoundError, SubcategoryNotFoundError } from "../../../domain/exceptions";
import { CATEGORY_REPOSITORY, type CategoryRepository } from "../../ports";
import { UpdateSubcategoryCommand } from "./update-subcategory.command";

export type UpdateSubcategoryResult = ReturnType<Category["toPrimitives"]>;

@Injectable()
export class UpdateSubcategoryHandler {
  constructor(
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: CategoryRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(command: UpdateSubcategoryCommand): Promise<UpdateSubcategoryResult> {
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

    // Update subcategory
    const updatedCategory = category.updateSubcategory(command.subcategoryId, {
      name: command.name,
      icon: command.icon,
    });

    const savedCategory = await this.categoryRepository.update(updatedCategory);

    // Emit domain event
    this.eventEmitter.emit("subcategory.updated", {
      categoryId: command.categoryId,
      subcategoryId: command.subcategoryId,
      workspaceId: command.workspaceId,
    });

    return savedCategory.toPrimitives();
  }
}
