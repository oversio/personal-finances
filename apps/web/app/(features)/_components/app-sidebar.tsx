"use client";

import { useParams } from "next/navigation";
import {
  useSidebarStore,
  selectIsCollapsed,
  selectIsMobileOpen,
} from "@/_commons/stores/sidebar.store";
import { useWorkspaceStore, selectCurrentWorkspaceId } from "@/_commons/stores/workspace.store";
import { cn } from "@/_commons/utils/cn";
import { SidebarItem } from "./sidebar-item";

function getWorkspaceNavItems(workspaceId: string) {
  return [
    {
      key: "dashboard",
      label: "Dashboard",
      icon: (
        <svg
          className="size-5"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      href: `/ws/${workspaceId}/dashboard`,
    },
    {
      key: "accounts",
      label: "Accounts",
      icon: (
        <svg
          className="size-5"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      href: `/ws/${workspaceId}/accounts`,
    },
    {
      key: "categories",
      label: "Categories",
      icon: (
        <svg
          className="size-5"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.159 3.66A2.25 2.25 0 0 0 9.568 3Z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M6 6h.008v.008H6V6Z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      href: `/ws/${workspaceId}/categories`,
    },
  ];
}

export function AppSidebar() {
  const params = useParams<{ workspaceId?: string }>();
  const storeWorkspaceId = useWorkspaceStore(selectCurrentWorkspaceId);

  // Prefer URL param over store (URL is source of truth)
  const workspaceId = params.workspaceId || storeWorkspaceId;

  const isCollapsed = useSidebarStore(selectIsCollapsed);
  const isMobileOpen = useSidebarStore(selectIsMobileOpen);
  const closeMobile = useSidebarStore(state => state.closeMobile);

  const workspaceNavItems = workspaceId ? getWorkspaceNavItems(workspaceId) : [];

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={closeMobile}
          onKeyDown={e => e.key === "Escape" && closeMobile()}
          role="button"
          tabIndex={0}
          aria-label="Close sidebar"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-14 z-50 h-[calc(100vh-3.5rem)] w-64 border-r border-divider bg-background",
          "transition-all duration-200 ease-in-out",
          "md:translate-x-0",
          isMobileOpen ? "translate-x-0" : "-translate-x-full",
          isCollapsed ? "md:w-16" : "md:w-64",
        )}
      >
        <nav className="flex h-full flex-col p-3">
          {workspaceNavItems.length > 0 && (
            <div className="flex flex-col gap-1">
              {workspaceNavItems.map(item => (
                <SidebarItem key={item.key} href={item.href} icon={item.icon} label={item.label} />
              ))}
            </div>
          )}

          <div className="mt-auto">
            {/* Future: Additional nav items like settings can go here */}
          </div>
        </nav>
      </aside>
    </>
  );
}
