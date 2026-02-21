"use client";

import { Modal, ModalBody, ModalContent, ModalHeader } from "@heroui/react";
import { CategoryForm } from "./category-form";
import type { CreateCategoryFormData } from "../_schemas/category.schema";

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: "income" | "expense";
  onSubmit: (data: CreateCategoryFormData) => void;
  isPending: boolean;
  error: Error | null;
}

export function CategoryFormModal({
  isOpen,
  onClose,
  defaultType,
  onSubmit,
  isPending,
  error,
}: CategoryFormModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalContent>
        <ModalHeader>Nueva Categoría</ModalHeader>
        <ModalBody className="pb-6">
          <CategoryForm
            defaultType={defaultType}
            onSubmit={onSubmit}
            isPending={isPending}
            error={error}
            submitLabel="Crear Categoría"
          />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
