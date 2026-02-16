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
        <ModalHeader>Eliminar Miembro</ModalHeader>
        <ModalBody>
          <p className="text-default-600">
            ¿Estás seguro de que deseas eliminar a <span className="font-medium">{member?.name}</span> de
            este espacio de trabajo?
          </p>
          <p className="text-small text-default-500">
            Perderá acceso a todos los datos del espacio de trabajo inmediatamente.
          </p>
        </ModalBody>
        <ModalFooter>
          <Button variant="flat" onPress={onClose}>
            Cancelar
          </Button>
          <Button color="danger" onPress={onConfirm} isLoading={isPending}>
            Eliminar Miembro
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
