"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SETTINGS_QUERY_KEYS } from "../_support/settings-query-keys";
import { updateWorkspaceSettings } from "./update-workspace-settings";

export function useUpdateWorkspaceSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [SETTINGS_QUERY_KEYS.updateSettings],
    mutationFn: updateWorkspaceSettings,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [SETTINGS_QUERY_KEYS.settings, variables.workspaceId],
      });
    },
  });
}
