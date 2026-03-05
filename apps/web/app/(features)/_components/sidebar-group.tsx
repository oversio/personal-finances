"use client";

import { useState } from "react";
import { Button, Tooltip } from "@heroui/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDownIcon } from "@repo/ui/icons";
import { useSidebarStore, selectIsCollapsed } from "@/_commons/stores/sidebar.store";
import { cn } from "@/_commons/utils/cn";

interface SidebarGroupChild {
  key: string;
  label: string;
  href: string;
}

interface SidebarGroupProps {
  label: string;
  icon: React.ReactNode;
  items: SidebarGroupChild[];
}

export function SidebarGroup({ label, icon, items }: SidebarGroupProps) {
  const pathname = usePathname();
  const isCollapsed = useSidebarStore(selectIsCollapsed);
  const closeMobile = useSidebarStore(state => state.closeMobile);

  // Check if any child is active
  const hasActiveChild = items.some(
    child => pathname === child.href || pathname.startsWith(`${child.href}/`),
  );

  // Start expanded if a child is active
  const [isExpanded, setIsExpanded] = useState(hasActiveChild);

  // When collapsed, show a dropdown-like tooltip with all items
  if (isCollapsed) {
    return (
      <Tooltip
        content={
          <div className="flex flex-col gap-1 py-1">
            <span className="px-2 text-xs font-semibold text-default-500">{label}</span>
            {items.map(child => (
              <Link
                key={child.key}
                href={child.href}
                className={cn(
                  "rounded-md px-2 py-1 text-sm hover:bg-default-100",
                  pathname === child.href || pathname.startsWith(`${child.href}/`)
                    ? "bg-primary-100 text-primary"
                    : "",
                )}
                onClick={closeMobile}
              >
                {child.label}
              </Link>
            ))}
          </div>
        }
        placement="right"
        delay={0}
      >
        <Button
          variant={hasActiveChild ? "flat" : "light"}
          color={hasActiveChild ? "primary" : "default"}
          className="min-w-10 w-full justify-center px-0"
        >
          <span className="shrink-0">{icon}</span>
        </Button>
      </Tooltip>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Group header */}
      <Button
        variant={hasActiveChild ? "flat" : "light"}
        color={hasActiveChild ? "primary" : "default"}
        className="w-full justify-between gap-3"
        onPress={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <span className="shrink-0">{icon}</span>
          <span className="truncate">{label}</span>
        </div>
        <ChevronDownIcon
          className={cn("size-4 shrink-0 transition-transform", isExpanded ? "" : "-rotate-90")}
        />
      </Button>

      {/* Children */}
      {isExpanded && (
        <div className="ml-4 mt-1 flex flex-col gap-1 border-l border-default-200 pl-3">
          {items.map(child => {
            const isActive = pathname === child.href || pathname.startsWith(`${child.href}/`);
            return (
              <Button
                key={child.key}
                as={Link}
                href={child.href}
                variant={isActive ? "flat" : "light"}
                color={isActive ? "primary" : "default"}
                size="sm"
                className="w-full justify-start"
                onPress={closeMobile}
              >
                <span className="truncate">{child.label}</span>
              </Button>
            );
          })}
        </div>
      )}
    </div>
  );
}
