"use client";

import { useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
  Spinner,
} from "@heroui/react";
import { useGetWorkspaces } from "../_api/use-get-workspaces";
import { useWorkspaceStore, selectCurrentWorkspaceId } from "@/_commons/stores/workspace.store";

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="m19.5 8.25-7.5 7.5-7.5-7.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function WorkspaceIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function WorkspaceSwitcher() {
  const router = useRouter();
  const params = useParams<{ workspaceId?: string }>();
  const { data: workspaces, isLoading } = useGetWorkspaces();

  const currentWorkspaceId = useWorkspaceStore(selectCurrentWorkspaceId);
  const setCurrentWorkspace = useWorkspaceStore(state => state.setCurrentWorkspace);

  // Determine which workspace to display
  const activeWorkspaceId = params.workspaceId || currentWorkspaceId;
  const currentWorkspace = workspaces?.find(ws => ws.id === activeWorkspaceId);

  const handleWorkspaceChange = useCallback(
    (workspaceId: string) => {
      setCurrentWorkspace(workspaceId);

      // Navigate to the dashboard of the selected workspace
      router.push(`/ws/${workspaceId}/dashboard`);
    },
    [router, setCurrentWorkspace],
  );

  if (isLoading) {
    return (
      <Button isIconOnly variant="light" isDisabled>
        <Spinner size="sm" />
      </Button>
    );
  }

  if (!workspaces || workspaces.length === 0) {
    return null;
  }

  // If only one workspace, just show the name without dropdown
  if (workspaces.length === 1) {
    const singleWorkspace = workspaces[0]!;
    return (
      <div className="flex items-center gap-2 px-2">
        <WorkspaceIcon className="size-5 text-default-500" />
        <span className="text-sm font-medium">{singleWorkspace.name}</span>
      </div>
    );
  }

  return (
    <Dropdown>
      <DropdownTrigger>
        <Button
          variant="light"
          className="h-auto gap-2 px-2 py-1"
          startContent={<WorkspaceIcon className="size-5" />}
          endContent={<ChevronDownIcon className="size-4" />}
        >
          <span className="max-w-32 truncate text-sm font-medium">
            {currentWorkspace?.name || "Select Workspace"}
          </span>
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label="Workspace selection"
        selectedKeys={activeWorkspaceId ? [activeWorkspaceId] : []}
        selectionMode="single"
        onSelectionChange={keys => {
          const selected = Array.from(keys)[0];
          if (typeof selected === "string") {
            handleWorkspaceChange(selected);
          }
        }}
      >
        {workspaces.map(workspace => (
          <DropdownItem key={workspace.id} description={workspace.role}>
            {workspace.name}
          </DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  );
}
