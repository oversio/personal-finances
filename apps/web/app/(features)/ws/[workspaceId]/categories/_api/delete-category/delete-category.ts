import { fetcher, IgnoreResponse } from "@/_commons/api";

export interface DeleteCategoryParams {
  workspaceId: string;
  categoryId: string;
}

export async function deleteCategory({ workspaceId, categoryId }: DeleteCategoryParams) {
  return fetcher(`/ws/${workspaceId}/categories/${categoryId}`, {
    method: "DELETE",
    schema: IgnoreResponse,
  });
}
