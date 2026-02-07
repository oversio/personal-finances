import { fetcher } from "@/_commons/api";
import { CategorySchema } from "./category.types";

export interface RemoveSubcategoryParams {
  workspaceId: string;
  categoryId: string;
  subcategoryId: string;
}

export async function removeSubcategory({
  workspaceId,
  categoryId,
  subcategoryId,
}: RemoveSubcategoryParams) {
  return fetcher(`/ws/${workspaceId}/categories/${categoryId}/subcategories/${subcategoryId}`, {
    method: "DELETE",
    schema: CategorySchema,
  });
}
