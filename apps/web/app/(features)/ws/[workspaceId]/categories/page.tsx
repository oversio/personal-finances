"use client";

import { Button } from "@heroui/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { CategoryList } from "./_components/category-list";

export default function CategoriesPage() {
  const params = useParams<{ workspaceId: string }>();
  const workspaceId = params.workspaceId;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Categorías</h1>
          <p className="text-default-500">Administra tus categorías de ingresos y gastos</p>
        </div>
        <Button as={Link} href={`/ws/${workspaceId}/categories/new`} color="primary">
          Nueva Categoría
        </Button>
      </div>

      <CategoryList workspaceId={workspaceId} />
    </div>
  );
}
