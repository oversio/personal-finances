"use client";

import { useState } from "react";
import { Button, Spinner, Tab, Tabs } from "@heroui/react";
import Link from "next/link";
import { ConfirmationDialog } from "@/_commons/components";
import { ApiError, isValidationErrors } from "@/_commons/api/errors";
import { useDeleteCategory } from "../_api/delete-category/use-delete-category";
import { useGetCategoryList } from "../_api/get-category-list/use-get-category-list";
import type { Category } from "../_api/category.types";
import { CategoryCard } from "./category-card";

interface CategoryListProps {
  workspaceId: string;
}

export function CategoryList({ workspaceId }: CategoryListProps) {
  const { data: categories, isLoading, error } = useGetCategoryList({ workspaceId });
  const {
    mutate: deleteCategory,
    isPending: isDeleting,
    error: deleteError,
    reset: resetDeleteError,
  } = useDeleteCategory();
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  const handleDeleteClick = (categoryId: string) => {
    const category = categories?.find(c => c.id === categoryId);
    if (category) {
      resetDeleteError();
      setCategoryToDelete(category);
    }
  };

  const handleConfirmDelete = () => {
    if (categoryToDelete) {
      deleteCategory(
        { workspaceId, categoryId: categoryToDelete.id },
        {
          onSuccess: () => setCategoryToDelete(null),
        },
      );
    }
  };

  const handleCloseDialog = () => {
    setCategoryToDelete(null);
    resetDeleteError();
  };

  const deleteErrorMessage = deleteError
    ? isValidationErrors(deleteError)
      ? deleteError.generalErrorsMessage
      : deleteError instanceof ApiError
        ? deleteError.message
        : "Error al eliminar la categoría"
    : null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-danger-200 bg-danger-50 p-4 text-danger">
        <p>Error al cargar las categorías. Por favor intenta de nuevo.</p>
      </div>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-default-300 py-12">
        <svg
          className="size-12 text-default-300"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          viewBox="0 0 24 24"
        >
          <path
            d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.159 3.66A2.25 2.25 0 0 0 9.568 3Z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M6 6h.008v.008H6V6Z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <div className="text-center">
          <h3 className="text-lg font-semibold">Aún no hay categorías</h3>
          <p className="text-small text-default-500">Crea tu primera categoría para comenzar</p>
        </div>
        <Button as={Link} href={`/ws/${workspaceId}/categories/new`} color="primary">
          Crear Categoría
        </Button>
      </div>
    );
  }

  const incomeCategories = categories.filter((c: Category) => c.type === "income");
  const expenseCategories = categories.filter((c: Category) => c.type === "expense");

  return (
    <>
      <Tabs aria-label="Category types" variant="underlined" classNames={{ panel: "pt-4" }}>
        <Tab key="expense" title={`Gastos (${expenseCategories.length})`}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {expenseCategories.map((category: Category) => (
              <CategoryCard
                key={category.id}
                category={category}
                workspaceId={workspaceId}
                onDelete={handleDeleteClick}
                isDeleting={isDeleting}
              />
            ))}
          </div>
          {expenseCategories.length === 0 && (
            <p className="py-8 text-center text-default-500">No hay categorías de gastos</p>
          )}
        </Tab>
        <Tab key="income" title={`Ingresos (${incomeCategories.length})`}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {incomeCategories.map((category: Category) => (
              <CategoryCard
                key={category.id}
                category={category}
                workspaceId={workspaceId}
                onDelete={handleDeleteClick}
                isDeleting={isDeleting}
              />
            ))}
          </div>
          {incomeCategories.length === 0 && (
            <p className="py-8 text-center text-default-500">No hay categorías de ingresos</p>
          )}
        </Tab>
      </Tabs>

      <ConfirmationDialog
        isOpen={categoryToDelete !== null}
        onClose={handleCloseDialog}
        onConfirm={handleConfirmDelete}
        title="Eliminar Categoría"
        message={`¿Estás seguro de que deseas eliminar la categoría "${categoryToDelete?.name}"?`}
        confirmLabel="Eliminar"
        confirmColor="danger"
        isPending={isDeleting}
        error={deleteErrorMessage}
      />
    </>
  );
}
