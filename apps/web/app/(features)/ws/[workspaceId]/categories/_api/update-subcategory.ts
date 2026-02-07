import { fetcher } from "@/_commons/api";
import { CategorySchema, type UpdateSubcategoryInput } from "./category.types";

export interface UpdateSubcategoryParams {
  workspaceId: string;
  categoryId: string;
  subcategoryId: string;
  data: UpdateSubcategoryInput;
}

export async function updateSubcategory({
  workspaceId,
  categoryId,
  subcategoryId,
  data,
}: UpdateSubcategoryParams) {
  return fetcher(`/ws/${workspaceId}/categories/${categoryId}/subcategories/${subcategoryId}`, {
    method: "PUT",
    body: data,
    schema: CategorySchema,
  });
}
