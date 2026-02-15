"use client";

import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@heroui/react";
import type { WorkspaceMember } from "../_api/settings.types";

interface RemoveMemberModalProps {
  member: WorkspaceMember | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isPending: boolean;
}

export function RemoveMemberModal({
  member,
  isOpen,
  onClose,
  onConfirm,
  isPending,
}: RemoveMemberModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader>Remove Member</ModalHeader>
        <ModalBody>
          <p className="text-default-600">
            Are you sure you want to remove <span className="font-medium">{member?.name}</span> from
            this workspace?
          </p>
          <p className="text-small text-default-500">
            They will lose access to all workspace data immediately.
          </p>
        </ModalBody>
        <ModalFooter>
          <Button variant="flat" onPress={onClose}>
            Cancel
          </Button>
          <Button color="danger" onPress={onConfirm} isLoading={isPending}>
            Remove Member
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
