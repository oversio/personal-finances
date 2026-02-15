import { fetcher } from "@/_commons/api";
import { CategorySchema } from "../category.types";

export interface GetCategoryParams {
  workspaceId: string;
  categoryId: string;
}

export async function getCategory({ workspaceId, categoryId }: GetCategoryParams) {
  return fetcher(`/ws/${workspaceId}/categories/${categoryId}`, {
    method: "GET",
    schema: CategorySchema,
  });
}
