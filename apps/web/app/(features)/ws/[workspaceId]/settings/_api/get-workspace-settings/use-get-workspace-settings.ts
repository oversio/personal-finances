"use client";

import { useQuery } from "@tanstack/react-query";
import { SETTINGS_QUERY_KEYS } from "../_support/settings-query-keys";
import { getWorkspaceSettings, type GetWorkspaceSettingsParams } from "./get-workspace-settings";

export function useGetWorkspaceSettings(params: GetWorkspaceSettingsParams) {
  return useQuery({
    queryKey: [SETTINGS_QUERY_KEYS.settings, params.workspaceId],
    queryFn: () => getWorkspaceSettings(params),
    enabled: !!params.workspaceId,
  });
}
