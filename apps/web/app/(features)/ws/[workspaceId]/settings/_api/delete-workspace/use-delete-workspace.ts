"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { WORKSPACE_QUERY_KEYS } from "@/(features)/_api/_support/workspace-query-keys";
import { SETTINGS_QUERY_KEYS } from "../_support/settings-query-keys";
import { deleteWorkspace } from "./delete-workspace";

export function useDeleteWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [SETTINGS_QUERY_KEYS.deleteWorkspace],
    mutationFn: deleteWorkspace,
    onSuccess: () => {
      // Invalidate workspaces list since one was deleted
      queryClient.invalidateQueries({
        queryKey: [WORKSPACE_QUERY_KEYS.list],
      });
    },
  });
}
