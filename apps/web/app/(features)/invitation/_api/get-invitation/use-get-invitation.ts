"use client";

import { useQuery } from "@tanstack/react-query";
import { INVITATION_QUERY_KEYS } from "../_support/invitation-query-keys";
import { getInvitation } from "./get-invitation";

export function useGetInvitation(token: string) {
  return useQuery({
    queryKey: [INVITATION_QUERY_KEYS.invitation, token],
    queryFn: () => getInvitation(token),
    enabled: !!token,
    retry: false,
  });
}
