"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SETTINGS_QUERY_KEYS } from "../_support/settings-query-keys";
import { resendInvitation } from "./resend-invitation";

export function useResendInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [SETTINGS_QUERY_KEYS.resendInvitation],
    mutationFn: resendInvitation,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [SETTINGS_QUERY_KEYS.pendingInvitations, variables.workspaceId],
      });
    },
  });
}
