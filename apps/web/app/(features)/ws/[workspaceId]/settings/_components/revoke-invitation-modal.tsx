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
        <ModalHeader>Revocar Invitación</ModalHeader>
        <ModalBody>
          <p>
            ¿Estás seguro de que deseas revocar la invitación para <strong>{invitation?.email}</strong>?
          </p>
          <p className="text-small text-default-500">
            Ya no podrán usar el enlace de invitación para unirse al espacio de trabajo.
          </p>
        </ModalBody>
        <ModalFooter>
          <Button variant="flat" onPress={onClose}>
            Cancelar
          </Button>
          <Button color="danger" onPress={onConfirm} isLoading={isPending}>
            Revocar Invitación
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
