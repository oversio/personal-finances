import { fetcher } from "@/_commons/api";
import { CategorySchema, type CreateCategoryInput } from "./category.types";

export interface CreateCategoryParams {
  workspaceId: string;
  data: CreateCategoryInput;
}

export async function createCategory({ workspaceId, data }: CreateCategoryParams) {
  return fetcher(`/ws/${workspaceId}/categories`, {
    method: "POST",
    body: data,
    schema: CategorySchema,
  });
}
