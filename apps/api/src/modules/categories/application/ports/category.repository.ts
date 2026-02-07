import { Category } from "../../domain/entities";

export const CATEGORY_REPOSITORY = Symbol("CATEGORY_REPOSITORY");

export interface CategoryRepository {
  save(category: Category): Promise<Category>;
  saveMany(categories: Category[]): Promise<Category[]>;
  findById(id: string): Promise<Category | null>;
  findByWorkspaceId(workspaceId: string, includeArchived?: boolean): Promise<Category[]>;
  findByNameTypeAndWorkspace(
    name: string,
    type: string,
    workspaceId: string,
  ): Promise<Category | null>;
  update(category: Category): Promise<Category>;
  delete(id: string): Promise<void>;
}
