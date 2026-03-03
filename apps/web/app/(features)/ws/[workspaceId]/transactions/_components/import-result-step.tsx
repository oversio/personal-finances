"use client";

import { Button } from "@heroui/react";
import { CheckCircleIcon } from "@repo/ui/icons";
import Link from "next/link";
import type { ConfirmImportResponse } from "../_api/import.types";

interface ImportResultStepProps {
  workspaceId: string;
  result: ConfirmImportResponse;
  onImportMore: () => void;
}

export function ImportResultStep({ workspaceId, result, onImportMore }: ImportResultStepProps) {
  const hasCreatedCategories = result.createdCategories && result.createdCategories.length > 0;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-success/20">
          <CheckCircleIcon className="size-10 text-success" />
        </div>
        <h2 className="text-lg font-semibold">Importación completada</h2>
        <p className="mt-1 text-small text-default-500">
          Las transacciones se han importado correctamente
        </p>
      </div>

      <div className="rounded-lg border border-default-200 p-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-default-600">Transacciones importadas:</span>
            <span className="font-semibold text-success-600">{result.imported}</span>
          </div>
          {result.skipped > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-default-600">Transacciones omitidas:</span>
              <span className="font-semibold text-default-400">{result.skipped}</span>
            </div>
          )}
          {hasCreatedCategories && (
            <div className="flex items-center justify-between">
              <span className="text-default-600">Categorías creadas:</span>
              <span className="font-semibold text-warning-600">
                {result.createdCategories.length}
              </span>
            </div>
          )}
        </div>
      </div>

      {hasCreatedCategories && (
        <div className="rounded-lg border border-warning-200 bg-warning-50 p-4">
          <p className="mb-2 font-medium text-warning-700">Categorías creadas:</p>
          <ul className="space-y-1 text-small text-warning-600">
            {result.createdCategories.map(cat => (
              <li key={cat.id}>
                <span className="font-medium">{cat.name}</span>
                {cat.subcategoriesCreated.length > 0 && (
                  <span className="text-warning-500">
                    {" "}
                    (subcategorías: {cat.subcategoriesCreated.join(", ")})
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button as={Link} href={`/ws/${workspaceId}/transactions`} color="primary">
          Ver transacciones
        </Button>
        {hasCreatedCategories && (
          <Button as={Link} href={`/ws/${workspaceId}/categories`} variant="bordered">
            Ver categorías
          </Button>
        )}
        <Button variant="flat" onPress={onImportMore}>
          Importar más
        </Button>
      </div>
    </div>
  );
}
