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
    {
      key: "transactions",
      label: "Transactions",
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
            d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      href: `/ws/${workspaceId}/transactions`,
    },
    {
      key: "budgets",
      label: "Budgets",
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
            d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      href: `/ws/${workspaceId}/budgets`,
    },
    {
      key: "recurring",
      label: "Recurring",
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
            d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      href: `/ws/${workspaceId}/recurring-transactions`,
    },
    {
      key: "settings",
      label: "Settings",
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
            d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      href: `/ws/${workspaceId}/settings`,
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
