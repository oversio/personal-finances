import { fetcher, listOf } from "@/_commons/api";
import { CategorySchema, type CategoryType } from "./category.types";

export interface GetCategoriesParams {
  workspaceId: string;
  type?: CategoryType;
  includeArchived?: boolean;
}

export async function getCategories({ workspaceId, type, includeArchived }: GetCategoriesParams) {
  const params: Record<string, string> = {};
  if (type) params.type = type;
  if (includeArchived) params.includeArchived = "true";

  return fetcher(`/ws/${workspaceId}/categories`, {
    method: "GET",
    params: Object.keys(params).length > 0 ? params : undefined,
    schema: listOf(CategorySchema),
  });
}
