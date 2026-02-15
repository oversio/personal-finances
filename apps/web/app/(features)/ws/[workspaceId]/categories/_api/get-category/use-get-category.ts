"use client";

import { useQuery } from "@tanstack/react-query";
import { CATEGORY_QUERY_KEYS } from "../_support/category-query-keys";
import { getCategory, type GetCategoryParams } from "./get-category";

export function useGetCategory(params: GetCategoryParams) {
  return useQuery({
    queryKey: [CATEGORY_QUERY_KEYS.detail, params.workspaceId, params.categoryId],
    queryFn: () => getCategory(params),
    enabled: !!params.workspaceId && !!params.categoryId,
  });
}
