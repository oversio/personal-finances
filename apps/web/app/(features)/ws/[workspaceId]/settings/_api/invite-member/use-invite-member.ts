"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SETTINGS_QUERY_KEYS } from "../_support/settings-query-keys";
import { inviteMember } from "./invite-member";

export function useInviteMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [SETTINGS_QUERY_KEYS.inviteMember],
    mutationFn: inviteMember,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [SETTINGS_QUERY_KEYS.members, variables.workspaceId],
      });
    },
  });
}
