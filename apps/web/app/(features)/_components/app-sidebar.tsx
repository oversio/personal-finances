"use client";

import { Divider } from "@heroui/react";
import {
  useSidebarStore,
  selectIsCollapsed,
  selectIsMobileOpen,
} from "@/_commons/stores/sidebar.store";
import { cn } from "@/_commons/utils/cn";
import { SidebarItem } from "./sidebar-item";

const NAV_ITEMS = [
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
    href: "/dashboard",
  },
] as const;

export function AppSidebar() {
  const isCollapsed = useSidebarStore(selectIsCollapsed);
  const isMobileOpen = useSidebarStore(selectIsMobileOpen);
  const closeMobile = useSidebarStore(state => state.closeMobile);

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
          <div className="flex flex-col gap-1">
            {NAV_ITEMS.map(item => (
              <SidebarItem key={item.key} href={item.href} icon={item.icon} label={item.label} />
            ))}
          </div>

          <Divider className="my-4" />

          <div className="mt-auto">
            {/* Future: Additional nav items like settings can go here */}
          </div>
        </nav>
      </aside>
    </>
  );
}
