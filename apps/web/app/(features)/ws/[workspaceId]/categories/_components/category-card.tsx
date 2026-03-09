"use client";

import { useState } from "react";
import {
  Button,
  Card,
  CardBody,
  Chip,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/react";
import Link from "next/link";
import { ConfirmationDialog } from "@/_commons/components";
import { ApiError, isValidationErrors } from "@/_commons/api/errors";
import type { Category, Subcategory } from "../_api/category.types";
import { useAddSubcategory } from "../_api/add-subcategory/use-add-subcategory";
import { useRemoveSubcategory } from "../_api/remove-subcategory/use-remove-subcategory";
import { useUpdateSubcategory } from "../_api/update-subcategory/use-update-subcategory";
import { CATEGORY_TYPE_LABELS } from "../_schemas/category.schema";
import { SubcategoryForm } from "./subcategory-form";
import type { SubcategoryFormData } from "../_schemas/category.schema";

interface CategoryCardProps {
  category: Category;
  workspaceId: string;
  onDelete: (categoryId: string) => void;
  isDeleting: boolean;
}

export function CategoryCard({ category, workspaceId, onDelete, isDeleting }: CategoryCardProps) {
  const [isSubcategoryModalOpen, setIsSubcategoryModalOpen] = useState(false);
  const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null);
  const [subcategoryToRemove, setSubcategoryToRemove] = useState<Subcategory | null>(null);

  const {
    mutate: addSubcategory,
    isPending: isAdding,
    error: addError,
    reset: resetAdd,
  } = useAddSubcategory();
  const {
    mutate: updateSubcategory,
    isPending: isUpdating,
    error: updateError,
    reset: resetUpdate,
  } = useUpdateSubcategory();
  const {
    mutate: removeSubcategory,
    isPending: isRemoving,
    error: removeError,
    reset: resetRemove,
  } = useRemoveSubcategory();

  const handleAddSubcategory = () => {
    setEditingSubcategory(null);
    resetAdd();
    setIsSubcategoryModalOpen(true);
  };

  const handleEditSubcategory = (subcategory: Subcategory) => {
    setEditingSubcategory(subcategory);
    resetUpdate();
    setIsSubcategoryModalOpen(true);
  };

  const handleRemoveSubcategoryClick = (subcategory: Subcategory) => {
    resetRemove();
    setSubcategoryToRemove(subcategory);
  };

  const handleConfirmRemoveSubcategory = () => {
    if (subcategoryToRemove) {
      removeSubcategory(
        {
          workspaceId,
          categoryId: category.id,
          subcategoryId: subcategoryToRemove.id,
        },
        {
          onSuccess: () => setSubcategoryToRemove(null),
        },
      );
    }
  };

  const handleCloseRemoveDialog = () => {
    setSubcategoryToRemove(null);
    resetRemove();
  };

  const removeErrorMessage = removeError
    ? isValidationErrors(removeError)
      ? removeError.generalErrorsMessage
      : removeError instanceof ApiError
        ? removeError.message
        : "Error al eliminar la subcategoría"
    : null;

  const handleSubcategorySubmit = (data: SubcategoryFormData) => {
    if (editingSubcategory) {
      updateSubcategory(
        {
          workspaceId,
          categoryId: category.id,
          subcategoryId: editingSubcategory.id,
          data,
        },
        {
          onSuccess: () => {
            setIsSubcategoryModalOpen(false);
            setEditingSubcategory(null);
          },
        },
      );
    } else {
      addSubcategory(
        {
          workspaceId,
          categoryId: category.id,
          data,
        },
        {
          onSuccess: () => {
            setIsSubcategoryModalOpen(false);
          },
        },
      );
    }
  };

  return (
    <>
      <Card className="overflow-hidden">
        <div className="h-1 w-full" style={{ backgroundColor: category.color }} />
        <CardBody className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <h3 className="text-lg font-semibold">{category.name}</h3>
              <Chip
                size="sm"
                variant="flat"
                color={category.type === "income" ? "success" : "danger"}
              >
                {CATEGORY_TYPE_LABELS[category.type]}
              </Chip>
            </div>

            <Dropdown>
              <DropdownTrigger>
                <Button isIconOnly size="sm" variant="light" aria-label="Acciones de categoría">
                  <svg
                    className="size-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="Acciones de categoría">
                <DropdownItem
                  key="edit"
                  as={Link}
                  href={`/ws/${workspaceId}/categories/${category.id}/edit`}
                >
                  Editar
                </DropdownItem>
                <DropdownItem key="add-subcategory" onPress={handleAddSubcategory}>
                  Agregar Subcategoría
                </DropdownItem>
                <DropdownItem
                  key="delete"
                  className="text-danger"
                  color="danger"
                  onPress={() => onDelete(category.id)}
                  isDisabled={isDeleting}
                >
                  Eliminar
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>

          {category.subcategories.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-small font-medium text-default-500">Subcategorías</p>
              <div className="flex flex-wrap gap-2">
                {category.subcategories.map(subcategory => (
                  <Chip
                    key={subcategory.id}
                    size="sm"
                    variant="flat"
                    onClose={() => handleRemoveSubcategoryClick(subcategory)}
                    isDisabled={isRemoving}
                    classNames={{
                      base: "cursor-pointer hover:bg-default-100",
                    }}
                    onClick={() => handleEditSubcategory(subcategory)}
                  >
                    {subcategory.name}
                  </Chip>
                ))}
              </div>
            </div>
          )}

          {category.subcategories.length === 0 && (
            <div className="mt-4">
              <Button size="sm" variant="flat" onPress={handleAddSubcategory}>
                + Agregar Subcategoría
              </Button>
            </div>
          )}
        </CardBody>
      </Card>

      <SubcategoryForm
        subcategory={editingSubcategory ?? undefined}
        isOpen={isSubcategoryModalOpen}
        onClose={() => {
          setIsSubcategoryModalOpen(false);
          setEditingSubcategory(null);
        }}
        onSubmit={handleSubcategorySubmit}
        isPending={isAdding || isUpdating}
        error={editingSubcategory ? updateError : addError}
      />

      <ConfirmationDialog
        isOpen={subcategoryToRemove !== null}
        onClose={handleCloseRemoveDialog}
        onConfirm={handleConfirmRemoveSubcategory}
        title="Eliminar Subcategoría"
        message={`¿Estás seguro de que deseas eliminar la subcategoría "${subcategoryToRemove?.name}"?`}
        confirmLabel="Eliminar"
        confirmColor="danger"
        isPending={isRemoving}
        error={removeErrorMessage}
      />
    </>
  );
}
