"use client";

import { useQuery } from "@tanstack/react-query";
import { SETTINGS_QUERY_KEYS } from "../_support/settings-query-keys";
import { getMemberList, type GetMemberListParams } from "./get-member-list";

export function useGetMemberList(params: GetMemberListParams) {
  return useQuery({
    queryKey: [SETTINGS_QUERY_KEYS.members, params.workspaceId],
    queryFn: () => getMemberList(params),
    enabled: !!params.workspaceId,
  });
}
