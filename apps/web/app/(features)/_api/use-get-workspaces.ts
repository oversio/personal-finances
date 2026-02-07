"use client";

import { useQuery } from "@tanstack/react-query";
import { WORKSPACE_QUERY_KEYS } from "./_support/workspace-query-keys";
import { getWorkspaces } from "./get-workspaces";

export function useGetWorkspaces() {
  return useQuery({
    queryKey: [WORKSPACE_QUERY_KEYS.list],
    queryFn: getWorkspaces,
  });
}
