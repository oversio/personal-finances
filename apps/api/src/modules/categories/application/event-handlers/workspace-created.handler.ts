import { Inject, Injectable, Logger } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { Category } from "../../domain/entities";
import { CATEGORY_REPOSITORY, type CategoryRepository } from "../ports";
import { DEFAULT_CATEGORIES } from "../seed-data/default-categories";

interface WorkspaceCreatedEvent {
  workspaceId: string;
  ownerId: string;
  name: string;
}

@Injectable()
export class WorkspaceCreatedHandler {
  private readonly logger = new Logger(WorkspaceCreatedHandler.name);

  constructor(
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: CategoryRepository,
  ) {}

  @OnEvent("workspace.created")
  async handle(event: WorkspaceCreatedEvent): Promise<void> {
    this.logger.log(`Seeding default categories for workspace ${event.workspaceId}`);

    const categories = DEFAULT_CATEGORIES.map(defaultCategory =>
      Category.create({
        workspaceId: event.workspaceId,
        name: defaultCategory.name,
        type: defaultCategory.type,
        icon: defaultCategory.icon,
        color: defaultCategory.color,
        subcategories: defaultCategory.subcategories,
      }),
    );

    await this.categoryRepository.saveMany(categories);

    this.logger.log(
      `Successfully seeded ${categories.length} default categories for workspace ${event.workspaceId}`,
    );
  }
}
