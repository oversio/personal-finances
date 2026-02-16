"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SETTINGS_QUERY_KEYS } from "../_support/settings-query-keys";
import { sendInvitation } from "./send-invitation";

export function useSendInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [SETTINGS_QUERY_KEYS.sendInvitation],
    mutationFn: sendInvitation,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [SETTINGS_QUERY_KEYS.pendingInvitations, variables.workspaceId],
      });
    },
  });
}
