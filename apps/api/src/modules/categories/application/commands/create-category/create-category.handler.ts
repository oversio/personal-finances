import { Inject, Injectable } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { Category } from "../../../domain/entities";
import { CategoryAlreadyExistsError } from "../../../domain/exceptions";
import { CATEGORY_REPOSITORY, type CategoryRepository } from "../../ports";
import { CreateCategoryCommand } from "./create-category.command";

export type CreateCategoryResult = ReturnType<Category["toPrimitives"]>;

@Injectable()
export class CreateCategoryHandler {
  constructor(
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: CategoryRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(command: CreateCategoryCommand): Promise<CreateCategoryResult> {
    // Check for duplicate name+type in workspace
    const existing = await this.categoryRepository.findByNameTypeAndWorkspace(
      command.name,
      command.type,
      command.workspaceId,
    );

    if (existing) {
      throw new CategoryAlreadyExistsError(command.name);
    }

    // Create the category
    const category = Category.create({
      workspaceId: command.workspaceId,
      name: command.name,
      type: command.type,
      subcategories: command.subcategories,
      icon: command.icon,
      color: command.color,
    });

    const savedCategory = await this.categoryRepository.save(category);

    // Emit domain event
    this.eventEmitter.emit("category.created", {
      categoryId: savedCategory.id!.value,
      workspaceId: command.workspaceId,
      name: command.name,
      type: command.type,
    });

    return savedCategory.toPrimitives();
  }
}
