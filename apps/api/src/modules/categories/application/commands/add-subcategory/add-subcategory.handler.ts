import { Inject, Injectable } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { Category } from "../../../domain/entities";
import { CategoryNotFoundError } from "../../../domain/exceptions";
import { Subcategory } from "../../../domain/value-objects";
import { CATEGORY_REPOSITORY, type CategoryRepository } from "../../ports";
import { AddSubcategoryCommand } from "./add-subcategory.command";

export type AddSubcategoryResult = ReturnType<Category["toPrimitives"]>;

@Injectable()
export class AddSubcategoryHandler {
  constructor(
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: CategoryRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(command: AddSubcategoryCommand): Promise<AddSubcategoryResult> {
    // Find the category
    const category = await this.categoryRepository.findById(command.categoryId);

    if (!category || category.workspaceId.value !== command.workspaceId) {
      throw new CategoryNotFoundError(command.categoryId);
    }

    // Create and add subcategory
    const subcategory = Subcategory.create({
      name: command.name,
      icon: command.icon,
    });

    const updatedCategory = category.addSubcategory(subcategory);
    const savedCategory = await this.categoryRepository.update(updatedCategory);

    // Emit domain event
    this.eventEmitter.emit("subcategory.added", {
      categoryId: command.categoryId,
      subcategoryId: subcategory.id,
      workspaceId: command.workspaceId,
    });

    return savedCategory.toPrimitives();
  }
}
