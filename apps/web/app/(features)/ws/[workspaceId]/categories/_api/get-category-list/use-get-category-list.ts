"use client";

import { useQuery } from "@tanstack/react-query";
import { CATEGORY_QUERY_KEYS } from "../_support/category-query-keys";
import { getCategoryList, type GetCategoryListParams } from "./get-category-list";

export function useGetCategoryList(params: GetCategoryListParams) {
  return useQuery({
    queryKey: [CATEGORY_QUERY_KEYS.list, params.workspaceId, params.type, params.includeArchived],
    queryFn: () => getCategoryList(params),
    enabled: !!params.workspaceId,
  });
}
