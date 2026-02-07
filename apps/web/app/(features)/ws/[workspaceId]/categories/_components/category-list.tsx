"use client";

import { Button, Spinner, Tab, Tabs } from "@heroui/react";
import Link from "next/link";
import { useDeleteCategory } from "../_api/use-delete-category";
import { useGetCategories } from "../_api/use-get-categories";
import type { Category } from "../_api/category.types";
import { CategoryCard } from "./category-card";

interface CategoryListProps {
  workspaceId: string;
}

export function CategoryList({ workspaceId }: CategoryListProps) {
  const { data: categories, isLoading, error } = useGetCategories({ workspaceId });
  const { mutate: deleteCategory, isPending: isDeleting } = useDeleteCategory();

  const handleArchive = (categoryId: string) => {
    if (confirm("Are you sure you want to archive this category?")) {
      deleteCategory({ workspaceId, categoryId });
    }
  };

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
        <p>Failed to load categories. Please try again.</p>
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
          <h3 className="text-lg font-semibold">No categories yet</h3>
          <p className="text-small text-default-500">Create your first category to get started</p>
        </div>
        <Button as={Link} href={`/ws/${workspaceId}/categories/new`} color="primary">
          Create Category
        </Button>
      </div>
    );
  }

  const incomeCategories = categories.filter((c: Category) => c.type === "income");
  const expenseCategories = categories.filter((c: Category) => c.type === "expense");

  return (
    <Tabs aria-label="Category types" variant="underlined" classNames={{ panel: "pt-4" }}>
      <Tab key="expense" title={`Expenses (${expenseCategories.length})`}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {expenseCategories.map((category: Category) => (
            <CategoryCard
              key={category.id}
              category={category}
              workspaceId={workspaceId}
              onArchive={handleArchive}
              isArchiving={isDeleting}
            />
          ))}
        </div>
        {expenseCategories.length === 0 && (
          <p className="py-8 text-center text-default-500">No expense categories</p>
        )}
      </Tab>
      <Tab key="income" title={`Income (${incomeCategories.length})`}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {incomeCategories.map((category: Category) => (
            <CategoryCard
              key={category.id}
              category={category}
              workspaceId={workspaceId}
              onArchive={handleArchive}
              isArchiving={isDeleting}
            />
          ))}
        </div>
        {incomeCategories.length === 0 && (
          <p className="py-8 text-center text-default-500">No income categories</p>
        )}
      </Tab>
    </Tabs>
  );
}
