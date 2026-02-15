import { fetcher, listOf } from "@/_commons/api";
import { CategorySchema, type CategoryType } from "../category.types";

export interface GetCategoryListParams {
  workspaceId: string;
  type?: CategoryType;
  includeArchived?: boolean;
}

export async function getCategoryList({
  workspaceId,
  type,
  includeArchived,
}: GetCategoryListParams) {
  const params: Record<string, string> = {};
  if (type) params.type = type;
  if (includeArchived) params.includeArchived = "true";

  return fetcher(`/ws/${workspaceId}/categories`, {
    method: "GET",
    params: Object.keys(params).length > 0 ? params : undefined,
    schema: listOf(CategorySchema),
  });
}
