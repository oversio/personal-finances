"use client";

import { Button, Tooltip } from "@heroui/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebarStore, selectIsCollapsed } from "@/_commons/stores/sidebar.store";
import { cn } from "@/_commons/utils/cn";

interface SidebarItemProps {
  href: string;
  label: string;
  icon: React.ReactNode;
}

export function SidebarItem({ href, label, icon }: SidebarItemProps) {
  const pathname = usePathname();
  const isCollapsed = useSidebarStore(selectIsCollapsed);
  const closeMobile = useSidebarStore(state => state.closeMobile);

  const isActive = pathname === href || pathname.startsWith(`${href}/`);

  const button = (
    <Button
      as={Link}
      href={href}
      variant={isActive ? "flat" : "light"}
      color={isActive ? "primary" : "default"}
      className={cn("w-full gap-3", isCollapsed ? "justify-center min-w-10 px-0" : "justify-start")}
      onPress={closeMobile}
    >
      <span className="shrink-0">{icon}</span>
      {!isCollapsed && <span className="truncate">{label}</span>}
    </Button>
  );

  if (isCollapsed) {
    return (
      <Tooltip content={label} placement="right" delay={0}>
        {button}
      </Tooltip>
    );
  }

  return button;
}
