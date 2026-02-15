"use client";

import { useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Avatar,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  DropdownSection,
  Spinner,
} from "@heroui/react";
import { useAuthStore, selectUser } from "@/_commons/stores/auth.store";
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

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="m4.5 12.75 6 6 9-13.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function AccountSwitcher() {
  const router = useRouter();
  const params = useParams<{ workspaceId?: string }>();

  // User state
  const user = useAuthStore(selectUser);
  const logout = useAuthStore(state => state.logout);

  // Workspace state
  const { data: workspaces, isLoading } = useGetWorkspaces();
  const currentWorkspaceId = useWorkspaceStore(selectCurrentWorkspaceId);
  const setCurrentWorkspace = useWorkspaceStore(state => state.setCurrentWorkspace);

  // Determine active workspace
  const activeWorkspaceId = params.workspaceId || currentWorkspaceId;
  const currentWorkspace = workspaces?.find(ws => ws.id === activeWorkspaceId);

  const initials = user?.name
    ? user.name
        .split(" ")
        .map(n => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  const handleWorkspaceChange = useCallback(
    (workspaceId: string) => {
      setCurrentWorkspace(workspaceId);
      router.push(`/ws/${workspaceId}/dashboard`);
    },
    [router, setCurrentWorkspace],
  );

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <Dropdown placement="bottom-end">
      <DropdownTrigger>
        <Button
          variant="light"
          className="h-auto gap-2 px-2 py-1"
          startContent={<Avatar className="size-6" name={initials} size="sm" showFallback />}
          endContent={<ChevronDownIcon className="size-4 text-default-400" />}
        >
          {isLoading ? (
            <Spinner size="sm" />
          ) : (
            <span className="max-w-32 truncate text-sm font-medium">
              {currentWorkspace?.name || "Select Workspace"}
            </span>
          )}
        </Button>
      </DropdownTrigger>
      <DropdownMenu aria-label="Account menu" variant="flat" className="w-64">
        {/* User profile section */}
        <DropdownSection showDivider>
          <DropdownItem key="profile" className="h-14 gap-2" textValue="User profile" isReadOnly>
            <p className="font-semibold">{user?.name ?? "User"}</p>
            <p className="text-small text-default-500">{user?.email ?? ""}</p>
          </DropdownItem>
        </DropdownSection>

        {/* Workspaces section */}
        <DropdownSection title="Workspaces" showDivider>
          {isLoading ? (
            <DropdownItem key="loading" textValue="Loading" isReadOnly>
              <div className="flex items-center gap-2">
                <Spinner size="sm" />
                <span className="text-default-500">Loading workspaces...</span>
              </div>
            </DropdownItem>
          ) : workspaces && workspaces.length > 0 ? (
            workspaces.map(workspace => (
              <DropdownItem
                key={workspace.id}
                textValue={workspace.name}
                startContent={
                  workspace.id === activeWorkspaceId ? (
                    <CheckIcon className="size-4 text-primary" />
                  ) : (
                    <div className="size-4" />
                  )
                }
                onPress={() => handleWorkspaceChange(workspace.id)}
              >
                <span className={workspace.id === activeWorkspaceId ? "font-medium" : ""}>
                  {workspace.name}
                </span>
              </DropdownItem>
            ))
          ) : (
            <DropdownItem key="no-workspaces" textValue="No workspaces" isReadOnly>
              <span className="text-default-500">No workspaces available</span>
            </DropdownItem>
          )}
        </DropdownSection>

        {/* Logout section */}
        <DropdownSection>
          <DropdownItem key="logout" color="danger" onPress={handleLogout}>
            Log out
          </DropdownItem>
        </DropdownSection>
      </DropdownMenu>
    </Dropdown>
  );
}
