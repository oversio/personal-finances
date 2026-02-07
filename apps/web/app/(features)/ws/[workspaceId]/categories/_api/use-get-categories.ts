"use client";

import { useQuery } from "@tanstack/react-query";
import { CATEGORY_QUERY_KEYS } from "./_support/category-query-keys";
import { getCategories, type GetCategoriesParams } from "./get-categories";

export function useGetCategories(params: GetCategoriesParams) {
  return useQuery({
    queryKey: [CATEGORY_QUERY_KEYS.list, params.workspaceId, params.type, params.includeArchived],
    queryFn: () => getCategories(params),
    enabled: !!params.workspaceId,
  });
}
