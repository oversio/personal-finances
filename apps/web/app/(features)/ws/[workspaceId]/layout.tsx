"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useWorkspaceStore } from "@/_commons/stores/workspace.store";

interface WorkspaceLayoutProps {
  children: React.ReactNode;
}

export default function WorkspaceLayout({ children }: WorkspaceLayoutProps) {
  const params = useParams<{ workspaceId: string }>();
  const setCurrentWorkspace = useWorkspaceStore(state => state.setCurrentWorkspace);

  // Sync workspace ID from URL to store
  useEffect(() => {
    if (params.workspaceId) {
      setCurrentWorkspace(params.workspaceId);
    }
  }, [params.workspaceId, setCurrentWorkspace]);

  return <>{children}</>;
}
