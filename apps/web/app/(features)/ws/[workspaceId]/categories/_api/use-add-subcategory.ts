"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CATEGORY_QUERY_KEYS } from "./_support/category-query-keys";
import { addSubcategory } from "./add-subcategory";

export function useAddSubcategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [CATEGORY_QUERY_KEYS.addSubcategory],
    mutationFn: addSubcategory,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [CATEGORY_QUERY_KEYS.list, variables.workspaceId],
      });
      queryClient.invalidateQueries({
        queryKey: [CATEGORY_QUERY_KEYS.detail, variables.workspaceId, variables.categoryId],
      });
    },
  });
}
