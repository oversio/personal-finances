"use client";

import { Button, Navbar, NavbarBrand, NavbarContent } from "@heroui/react";
import { useSidebarStore, selectIsMobileOpen } from "@/_commons/stores/sidebar.store";
import { UserMenu } from "./user-menu";

function HamburgerIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <svg
      className="size-6"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      {isOpen ? (
        <path d="M6 18 18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <path
          d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}

export function AppNavbar() {
  const isMobileOpen = useSidebarStore(selectIsMobileOpen);
  const toggleCollapsed = useSidebarStore(state => state.toggleCollapsed);
  const toggleMobileOpen = useSidebarStore(state => state.toggleMobileOpen);

  const handleToggle = () => {
    // On mobile, toggle drawer; on desktop, toggle collapse
    if (window.innerWidth < 768) {
      toggleMobileOpen();
    } else {
      toggleCollapsed();
    }
  };

  return (
    <Navbar
      classNames={{
        base: "border-b border-divider",
        wrapper: "max-w-full px-4",
      }}
      height="3.5rem"
      isBordered={false}
    >
      <NavbarContent justify="start">
        <Button
          isIconOnly
          aria-label={isMobileOpen ? "Close menu" : "Open menu"}
          variant="light"
          onPress={handleToggle}
        >
          <HamburgerIcon isOpen={isMobileOpen} />
        </Button>
        <NavbarBrand className="hidden sm:flex">
          <p className="font-semibold text-inherit">Personal Finances</p>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent justify="end">
        <UserMenu />
      </NavbarContent>
    </Navbar>
  );
}
