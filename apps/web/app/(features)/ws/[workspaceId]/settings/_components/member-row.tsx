"use client";

import {
  Avatar,
  Button,
  Chip,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/react";
import type { WorkspaceMember, MemberRole } from "../_api/settings.types";

interface MemberRowProps {
  member: WorkspaceMember;
  currentUserRole: MemberRole;
  onChangeRole: (member: WorkspaceMember) => void;
  onRemove: (member: WorkspaceMember) => void;
}

const roleColors: Record<MemberRole, "success" | "warning" | "default"> = {
  owner: "success",
  admin: "warning",
  member: "default",
};

const roleLabels: Record<MemberRole, string> = {
  owner: "Propietario",
  admin: "Administrador",
  member: "Miembro",
};

export function MemberRow({ member, currentUserRole, onChangeRole, onRemove }: MemberRowProps) {
  const canManage = currentUserRole === "owner" || currentUserRole === "admin";
  const isOwner = member.role === "owner";
  const canModifyThisMember = canManage && !isOwner;

  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-3">
        <Avatar
          src={member.picture ?? undefined}
          name={member.name}
          size="sm"
          showFallback
          className="shrink-0"
        />
        <div className="min-w-0">
          <p className="truncate font-medium text-foreground">{member.name}</p>
          <p className="truncate text-small text-default-500">{member.email}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Chip color={roleColors[member.role]} size="sm" variant="flat">
          {roleLabels[member.role]}
        </Chip>

        {canModifyThisMember && (
          <Dropdown>
            <DropdownTrigger>
              <Button isIconOnly size="sm" variant="light">
                <svg
                  className="size-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Acciones de miembro">
              <DropdownItem key="change-role" onPress={() => onChangeRole(member)}>
                Cambiar rol
              </DropdownItem>
              <DropdownItem
                key="remove"
                className="text-danger"
                color="danger"
                onPress={() => onRemove(member)}
              >
                Eliminar del espacio de trabajo
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        )}
      </div>
    </div>
  );
}
