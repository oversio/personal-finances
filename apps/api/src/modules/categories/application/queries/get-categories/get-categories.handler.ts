import { Inject, Injectable } from "@nestjs/common";
import { Category } from "../../../domain/entities";
import { CATEGORY_REPOSITORY, type CategoryRepository } from "../../ports";
import { GetCategoriesQuery } from "./get-categories.query";

export type GetCategoriesResult = ReturnType<Category["toPrimitives"]>[];

@Injectable()
export class GetCategoriesHandler {
  constructor(
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: CategoryRepository,
  ) {}

  async execute(query: GetCategoriesQuery): Promise<GetCategoriesResult> {
    let categories = await this.categoryRepository.findByWorkspaceId(
      query.workspaceId,
      query.includeArchived,
    );

    // Filter by type if specified
    if (query.type) {
      categories = categories.filter(category => category.type.value === query.type);
    }

    return categories.map(category => category.toPrimitives());
  }
}
