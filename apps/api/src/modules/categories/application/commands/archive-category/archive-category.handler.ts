import { Inject, Injectable } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { CategoryNotFoundError } from "../../../domain/exceptions";
import { CATEGORY_REPOSITORY, type CategoryRepository } from "../../ports";
import { ArchiveCategoryCommand } from "./archive-category.command";

@Injectable()
export class ArchiveCategoryHandler {
  constructor(
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: CategoryRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(command: ArchiveCategoryCommand): Promise<void> {
    // Find the category
    const category = await this.categoryRepository.findById(command.id);

    if (!category || category.workspaceId.value !== command.workspaceId) {
      throw new CategoryNotFoundError(command.id);
    }

    // Archive the category
    const archivedCategory = category.archive();
    await this.categoryRepository.update(archivedCategory);

    // Emit domain event
    this.eventEmitter.emit("category.archived", {
      categoryId: command.id,
      workspaceId: command.workspaceId,
    });
  }
}
