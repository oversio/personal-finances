"use client";

import {
  Alert,
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/react";

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmColor?: "primary" | "danger" | "warning" | "success";
  isPending?: boolean;
  error?: string | null;
}

export function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  confirmColor = "primary",
  isPending = false,
  error = null,
}: ConfirmationDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <ModalContent>
        <ModalHeader className={confirmColor === "danger" ? "text-danger" : undefined}>
          {title}
        </ModalHeader>
        <ModalBody className="gap-3">
          {error ? (
            <Alert color="danger" variant="flat" description={error} />
          ) : (
            <p className="text-default-600">{message}</p>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="flat" onPress={onClose} isDisabled={isPending}>
            {error ? "Cerrar" : cancelLabel}
          </Button>
          {!error && (
            <Button color={confirmColor} onPress={onConfirm} isLoading={isPending}>
              {confirmLabel}
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
