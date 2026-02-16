"use client";

import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/react";
import { useState } from "react";

interface DeleteWorkspaceModalProps {
  workspaceName: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isPending: boolean;
}

export function DeleteWorkspaceModal({
  workspaceName,
  isOpen,
  onClose,
  onConfirm,
  isPending,
}: DeleteWorkspaceModalProps) {
  const [confirmText, setConfirmText] = useState("");
  const isConfirmed = confirmText === workspaceName;

  const handleClose = () => {
    setConfirmText("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <ModalContent>
        <ModalHeader className="text-danger">Eliminar Espacio de Trabajo</ModalHeader>
        <ModalBody className="gap-4">
          <p className="text-default-600">
            Esta acción no se puede deshacer. Esto eliminará permanentemente el espacio de trabajo{" "}
            <span className="font-medium">{workspaceName}</span> y todos sus datos incluyendo:
          </p>
          <ul className="list-inside list-disc space-y-1 text-small text-default-500">
            <li>Todas las cuentas y sus saldos</li>
            <li>Todas las transacciones y transferencias</li>
            <li>Todas las categorías y presupuestos</li>
            <li>Todas las transacciones recurrentes</li>
            <li>Todos los miembros del espacio de trabajo</li>
          </ul>
          <Input
            label={`Escribe "${workspaceName}" para confirmar`}
            placeholder={workspaceName}
            value={confirmText}
            onValueChange={setConfirmText}
            variant="flat"
          />
        </ModalBody>
        <ModalFooter>
          <Button variant="flat" onPress={handleClose}>
            Cancelar
          </Button>
          <Button
            color="danger"
            onPress={onConfirm}
            isLoading={isPending}
            isDisabled={!isConfirmed}
          >
            Eliminar Espacio de Trabajo
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
