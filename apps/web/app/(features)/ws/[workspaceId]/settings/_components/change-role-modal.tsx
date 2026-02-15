"use client";

import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
} from "@heroui/react";
import { useState } from "react";
import type { WorkspaceMember } from "../_api/settings.types";
import { ROLE_DESCRIPTIONS, ROLE_LABELS } from "../_schemas/invite-member.schema";

interface ChangeRoleModalProps {
  member: WorkspaceMember | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (role: "admin" | "member") => void;
  isPending: boolean;
}

export function ChangeRoleModal({
  member,
  isOpen,
  onClose,
  onSubmit,
  isPending,
}: ChangeRoleModalProps) {
  const [role, setRole] = useState<"admin" | "member">(
    (member?.role === "admin" ? "admin" : "member") as "admin" | "member",
  );

  const handleClose = () => {
    onClose();
  };

  const handleSubmit = () => {
    onSubmit(role);
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <ModalContent>
        <ModalHeader>Change Role</ModalHeader>
        <ModalBody className="gap-4">
          <p className="text-default-600">
            Change the role for <span className="font-medium">{member?.name}</span>
          </p>

          <Select
            label="Role"
            placeholder="Select role"
            selectedKeys={[role]}
            onSelectionChange={keys => {
              const value = Array.from(keys)[0] as "admin" | "member";
              if (value) setRole(value);
            }}
            variant="flat"
          >
            {Object.entries(ROLE_LABELS).map(([value, label]) => (
              <SelectItem
                key={value}
                description={ROLE_DESCRIPTIONS[value as keyof typeof ROLE_DESCRIPTIONS]}
              >
                {label}
              </SelectItem>
            ))}
          </Select>
        </ModalBody>
        <ModalFooter>
          <Button variant="flat" onPress={handleClose}>
            Cancel
          </Button>
          <Button
            color="primary"
            onPress={handleSubmit}
            isLoading={isPending}
            isDisabled={member?.role === role}
          >
            Save Changes
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
