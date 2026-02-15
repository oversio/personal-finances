"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CATEGORY_QUERY_KEYS } from "../_support/category-query-keys";
import { deleteCategory } from "./delete-category";

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [CATEGORY_QUERY_KEYS.delete],
    mutationFn: deleteCategory,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [CATEGORY_QUERY_KEYS.list, variables.workspaceId],
      });
    },
  });
}
