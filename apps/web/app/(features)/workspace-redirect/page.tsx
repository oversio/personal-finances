"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@heroui/react";
import { useGetWorkspaces } from "../_api/use-get-workspaces";

export default function WorkspaceRedirectPage() {
  const router = useRouter();
  const { data: workspaces, isLoading, error } = useGetWorkspaces();

  useEffect(() => {
    if (isLoading) return;

    if (error) {
      // If there's an error fetching workspaces, redirect to login
      router.replace("/login");
      return;
    }

    if (workspaces && workspaces.length > 0) {
      // Prefer the default workspace, otherwise use the first one
      const defaultWorkspace = workspaces.find(ws => ws.isDefault);
      const targetWorkspace = defaultWorkspace ?? workspaces[0]!;
      router.replace(`/ws/${targetWorkspace.id}/dashboard`);
    } else {
      // No workspaces - this shouldn't happen normally as users get
      // a default workspace on registration, but handle it gracefully
      // In the future, this could redirect to a "create workspace" page
      router.replace("/login");
    }
  }, [workspaces, isLoading, error, router]);

  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Spinner size="lg" />
        <p className="text-default-500">Loading your workspace...</p>
      </div>
    </div>
  );
}
