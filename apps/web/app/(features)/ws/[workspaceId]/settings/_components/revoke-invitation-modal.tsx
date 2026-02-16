"use client";

import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from "@heroui/react";
import type { PendingInvitation } from "../_api/settings.types";

interface RevokeInvitationModalProps {
  invitation: PendingInvitation | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isPending: boolean;
}

export function RevokeInvitationModal({
  invitation,
  isOpen,
  onClose,
  onConfirm,
  isPending,
}: RevokeInvitationModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader>Revoke Invitation</ModalHeader>
        <ModalBody>
          <p>
            Are you sure you want to revoke the invitation for <strong>{invitation?.email}</strong>?
          </p>
          <p className="text-small text-default-500">
            They will no longer be able to use the invitation link to join the workspace.
          </p>
        </ModalBody>
        <ModalFooter>
          <Button variant="flat" onPress={onClose}>
            Cancel
          </Button>
          <Button color="danger" onPress={onConfirm} isLoading={isPending}>
            Revoke Invitation
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
