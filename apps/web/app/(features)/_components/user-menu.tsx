"use client";

import {
  Avatar,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  DropdownSection,
} from "@heroui/react";
import { useRouter } from "next/navigation";
import { useAuthStore, selectUser } from "@/_commons/stores/auth.store";

export function UserMenu() {
  const router = useRouter();
  const user = useAuthStore(selectUser);
  const logout = useAuthStore(state => state.logout);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const initials = user?.name
    ? user.name
        .split(" ")
        .map(n => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <Dropdown placement="bottom-end">
      <DropdownTrigger>
        <Avatar
          as="button"
          className="transition-transform"
          name={initials}
          size="sm"
          showFallback
        />
      </DropdownTrigger>
      <DropdownMenu aria-label="User menu" variant="flat">
        <DropdownSection showDivider>
          <DropdownItem key="profile" className="h-14 gap-2" textValue="User profile">
            <p className="font-semibold">{user?.name ?? "User"}</p>
            <p className="text-small text-default-500">{user?.email ?? ""}</p>
          </DropdownItem>
        </DropdownSection>
        <DropdownSection>
          <DropdownItem key="logout" color="danger" onPress={handleLogout}>
            Log out
          </DropdownItem>
        </DropdownSection>
      </DropdownMenu>
    </Dropdown>
  );
}
