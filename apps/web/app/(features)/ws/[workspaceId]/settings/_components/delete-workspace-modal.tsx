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
        <ModalHeader className="text-danger">Delete Workspace</ModalHeader>
        <ModalBody className="gap-4">
          <p className="text-default-600">
            This action cannot be undone. This will permanently delete the workspace{" "}
            <span className="font-medium">{workspaceName}</span> and all of its data including:
          </p>
          <ul className="list-inside list-disc space-y-1 text-small text-default-500">
            <li>All accounts and their balances</li>
            <li>All transactions and transfers</li>
            <li>All categories and budgets</li>
            <li>All recurring transactions</li>
            <li>All workspace members</li>
          </ul>
          <Input
            label={`Type "${workspaceName}" to confirm`}
            placeholder={workspaceName}
            value={confirmText}
            onValueChange={setConfirmText}
            variant="flat"
          />
        </ModalBody>
        <ModalFooter>
          <Button variant="flat" onPress={handleClose}>
            Cancel
          </Button>
          <Button
            color="danger"
            onPress={onConfirm}
            isLoading={isPending}
            isDisabled={!isConfirmed}
          >
            Delete Workspace
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
