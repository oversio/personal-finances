"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { INVITATION_QUERY_KEYS } from "../_support/invitation-query-keys";
import { acceptInvitation } from "./accept-invitation";

export function useAcceptInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [INVITATION_QUERY_KEYS.accept],
    mutationFn: acceptInvitation,
    onSuccess: (_, token) => {
      queryClient.invalidateQueries({
        queryKey: [INVITATION_QUERY_KEYS.invitation, token],
      });
    },
  });
}
