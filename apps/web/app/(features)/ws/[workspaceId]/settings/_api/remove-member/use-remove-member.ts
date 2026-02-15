"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SETTINGS_QUERY_KEYS } from "../_support/settings-query-keys";
import { removeMember } from "./remove-member";

export function useRemoveMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [SETTINGS_QUERY_KEYS.removeMember],
    mutationFn: removeMember,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [SETTINGS_QUERY_KEYS.members, variables.workspaceId],
      });
    },
  });
}
