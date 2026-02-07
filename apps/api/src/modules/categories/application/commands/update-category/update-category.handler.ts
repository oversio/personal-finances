import { Inject, Injectable } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { Category } from "../../../domain/entities";
import { CategoryAlreadyExistsError, CategoryNotFoundError } from "../../../domain/exceptions";
import { CATEGORY_REPOSITORY, type CategoryRepository } from "../../ports";
import { UpdateCategoryCommand } from "./update-category.command";

export type UpdateCategoryResult = ReturnType<Category["toPrimitives"]>;

@Injectable()
export class UpdateCategoryHandler {
  constructor(
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: CategoryRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(command: UpdateCategoryCommand): Promise<UpdateCategoryResult> {
    // Find the category
    const category = await this.categoryRepository.findById(command.id);

    if (!category || category.workspaceId.value !== command.workspaceId) {
      throw new CategoryNotFoundError(command.id);
    }

    // Determine new name and type for duplicate check
    const newName = command.name ?? category.name.value;
    const newType = command.type ?? category.type.value;

    // Check for duplicate name+type if either is being changed
    if (command.name || command.type) {
      const existing = await this.categoryRepository.findByNameTypeAndWorkspace(
        newName,
        newType,
        command.workspaceId,
      );

      if (existing && existing.id?.value !== command.id) {
        throw new CategoryAlreadyExistsError(newName);
      }
    }

    // Update the category
    const updatedCategory = category.update({
      name: command.name,
      type: command.type,
      icon: command.icon,
      color: command.color,
    });

    const savedCategory = await this.categoryRepository.update(updatedCategory);

    // Emit domain event
    this.eventEmitter.emit("category.updated", {
      categoryId: savedCategory.id!.value,
      workspaceId: command.workspaceId,
    });

    return savedCategory.toPrimitives();
  }
}
