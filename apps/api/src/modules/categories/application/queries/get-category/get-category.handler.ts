import { Inject, Injectable } from "@nestjs/common";
import { Category } from "../../../domain/entities";
import { CategoryNotFoundError } from "../../../domain/exceptions";
import { CATEGORY_REPOSITORY, type CategoryRepository } from "../../ports";
import { GetCategoryQuery } from "./get-category.query";

export type GetCategoryResult = ReturnType<Category["toPrimitives"]>;

@Injectable()
export class GetCategoryHandler {
  constructor(
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: CategoryRepository,
  ) {}

  async execute(query: GetCategoryQuery): Promise<GetCategoryResult> {
    const category = await this.categoryRepository.findById(query.id);

    if (!category || category.workspaceId.value !== query.workspaceId) {
      throw new CategoryNotFoundError(query.id);
    }

    return category.toPrimitives();
  }
}
