"use client";

import { Button, Card, CardBody, CardHeader, Spinner } from "@heroui/react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useGetCategory } from "../../_api/get-category/use-get-category";
import { useUpdateCategory } from "../../_api/update-category/use-update-category";
import { CategoryForm } from "../../_components/category-form";
import type { CreateCategoryFormData } from "../../_schemas/category.schema";

export default function EditCategoryPage() {
  const params = useParams<{ workspaceId: string; id: string }>();
  const router = useRouter();
  const workspaceId = params.workspaceId;
  const categoryId = params.id;

  const {
    data: category,
    isLoading,
    error: fetchError,
  } = useGetCategory({ workspaceId, categoryId });
  const { mutate: updateCategory, isPending, error: updateError } = useUpdateCategory();

  const handleSubmit = (data: CreateCategoryFormData) => {
    updateCategory(
      {
        workspaceId,
        categoryId,
        data: {
          name: data.name,
          type: data.type,
          color: data.color,
          icon: data.icon,
        },
      },
      {
        onSuccess: () => {
          router.push(`/ws/${workspaceId}/categories`);
        },
      },
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (fetchError || !category) {
    return (
      <div className="rounded-lg border border-danger-200 bg-danger-50 p-4 text-danger">
        <p>Categoría no encontrada o error al cargar.</p>
        <Button as={Link} href={`/ws/${workspaceId}/categories`} className="mt-4" variant="flat">
          Volver a Categorías
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-6 flex items-center gap-4">
        <Button as={Link} href={`/ws/${workspaceId}/categories`} variant="light" isIconOnly>
          <svg
            className="size-5"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            viewBox="0 0 24 24"
          >
            <path
              d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Editar Categoría</h1>
          <p className="text-default-500">{category.name}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Detalles de la Categoría</h2>
        </CardHeader>
        <CardBody>
          <CategoryForm
            category={category}
            onSubmit={handleSubmit}
            isPending={isPending}
            error={updateError}
            submitLabel="Guardar Cambios"
          />
        </CardBody>
      </Card>
    </div>
  );
}
