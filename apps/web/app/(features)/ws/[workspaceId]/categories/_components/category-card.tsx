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
  onArchive: (categoryId: string) => void;
  isArchiving: boolean;
}

export function CategoryCard({ category, workspaceId, onArchive, isArchiving }: CategoryCardProps) {
  const [isSubcategoryModalOpen, setIsSubcategoryModalOpen] = useState(false);
  const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null);

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
  const { mutate: removeSubcategory, isPending: isRemoving } = useRemoveSubcategory();

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

  const handleRemoveSubcategory = (subcategoryId: string) => {
    if (confirm("Are you sure you want to remove this subcategory?")) {
      removeSubcategory({
        workspaceId,
        categoryId: category.id,
        subcategoryId,
      });
    }
  };

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
                <Button isIconOnly size="sm" variant="light" aria-label="Category actions">
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
              <DropdownMenu aria-label="Category actions">
                <DropdownItem
                  key="edit"
                  as={Link}
                  href={`/ws/${workspaceId}/categories/${category.id}/edit`}
                >
                  Edit
                </DropdownItem>
                <DropdownItem key="add-subcategory" onPress={handleAddSubcategory}>
                  Add Subcategory
                </DropdownItem>
                <DropdownItem
                  key="archive"
                  className="text-danger"
                  color="danger"
                  onPress={() => onArchive(category.id)}
                  isDisabled={isArchiving}
                >
                  Archive
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>

          {category.subcategories.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-small font-medium text-default-500">Subcategories</p>
              <div className="flex flex-wrap gap-2">
                {category.subcategories.map(subcategory => (
                  <Chip
                    key={subcategory.id}
                    size="sm"
                    variant="flat"
                    onClose={() => handleRemoveSubcategory(subcategory.id)}
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
                + Add Subcategory
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
    </>
  );
}
