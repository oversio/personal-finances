"use client";

import { useQuery } from "@tanstack/react-query";
import { SETTINGS_QUERY_KEYS } from "../_support/settings-query-keys";
import { getPendingInvitationList } from "./get-pending-invitation-list";

export function useGetPendingInvitationList(workspaceId: string) {
  return useQuery({
    queryKey: [SETTINGS_QUERY_KEYS.pendingInvitations, workspaceId],
    queryFn: () => getPendingInvitationList(workspaceId),
    enabled: !!workspaceId,
  });
}
