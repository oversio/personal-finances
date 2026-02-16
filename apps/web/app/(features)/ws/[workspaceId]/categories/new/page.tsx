"use client";

import { Button, Card, CardBody, CardHeader } from "@heroui/react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCreateCategory } from "../_api/create-category/use-create-category";
import { CategoryForm } from "../_components/category-form";
import type { CreateCategoryFormData } from "../_schemas/category.schema";

export default function NewCategoryPage() {
  const params = useParams<{ workspaceId: string }>();
  const router = useRouter();
  const workspaceId = params.workspaceId;

  const { mutate: createCategory, isPending, error } = useCreateCategory();

  const handleSubmit = (data: CreateCategoryFormData) => {
    createCategory(
      { workspaceId, data },
      {
        onSuccess: () => {
          router.push(`/ws/${workspaceId}/categories`);
        },
      },
    );
  };

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
          <h1 className="text-2xl font-bold">Nueva Categoría</h1>
          <p className="text-default-500">Crea una nueva categoría para tus transacciones</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Detalles de la Categoría</h2>
        </CardHeader>
        <CardBody>
          <CategoryForm onSubmit={handleSubmit} isPending={isPending} error={error} />
        </CardBody>
      </Card>
    </div>
  );
}
