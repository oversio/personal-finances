"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SETTINGS_QUERY_KEYS } from "../_support/settings-query-keys";
import { revokeInvitation } from "./revoke-invitation";

export function useRevokeInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [SETTINGS_QUERY_KEYS.revokeInvitation],
    mutationFn: revokeInvitation,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [SETTINGS_QUERY_KEYS.pendingInvitations, variables.workspaceId],
      });
    },
  });
}
