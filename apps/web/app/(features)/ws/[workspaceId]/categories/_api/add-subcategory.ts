import { fetcher } from "@/_commons/api";
import { CategorySchema, type AddSubcategoryInput } from "./category.types";

export interface AddSubcategoryParams {
  workspaceId: string;
  categoryId: string;
  data: AddSubcategoryInput;
}

export async function addSubcategory({ workspaceId, categoryId, data }: AddSubcategoryParams) {
  return fetcher(`/ws/${workspaceId}/categories/${categoryId}/subcategories`, {
    method: "POST",
    body: data,
    schema: CategorySchema,
  });
}
