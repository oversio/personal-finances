import { fetcher } from "@/_commons/api";
import { CategorySchema, type UpdateCategoryInput } from "./category.types";

export interface UpdateCategoryParams {
  workspaceId: string;
  categoryId: string;
  data: UpdateCategoryInput;
}

export async function updateCategory({ workspaceId, categoryId, data }: UpdateCategoryParams) {
  return fetcher(`/ws/${workspaceId}/categories/${categoryId}`, {
    method: "PUT",
    body: data,
    schema: CategorySchema,
  });
}
