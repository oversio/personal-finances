"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CATEGORY_QUERY_KEYS } from "./_support/category-query-keys";
import { createCategory } from "./create-category";

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [CATEGORY_QUERY_KEYS.create],
    mutationFn: createCategory,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [CATEGORY_QUERY_KEYS.list, variables.workspaceId],
      });
    },
  });
}
