"use client";

import { Button, Checkbox, RadioGroup, Radio } from "@heroui/react";
import { CheckCircleIcon, ExclamationTriangleIcon, XCircleIcon } from "@repo/ui/icons";
import type { CategoryToCreate, ImportSummary } from "../_api/import.types";

interface ImportConfirmStepProps {
  summary: ImportSummary;
  categoriesToCreate: CategoryToCreate[];
  skipInvalid: boolean;
  onSkipInvalidChange: (skip: boolean) => void;
  createMissingCategories: boolean;
  onCreateMissingCategoriesChange: (create: boolean) => void;
  onBack: () => void;
  onConfirm: () => void;
  isPending: boolean;
}

const CATEGORY_TYPE_LABELS: Record<string, string> = {
  income: "Ingreso",
  expense: "Gasto",
};

export function ImportConfirmStep({
  summary,
  categoriesToCreate,
  skipInvalid,
  onSkipInvalidChange,
  createMissingCategories,
  onCreateMissingCategoriesChange,
  onBack,
  onConfirm,
  isPending,
}: ImportConfirmStepProps) {
  const hasInvalidRows = summary.invalid > 0;
  const hasWarningRows = summary.warnings > 0;

  // Calculate import count based on settings
  const importCount = createMissingCategories ? summary.valid + summary.warnings : summary.valid;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-lg font-semibold">Confirmar importación</h2>
        <p className="mt-1 text-small text-default-500">
          Revisa el resumen y confirma la importación
        </p>
      </div>

      <div className="rounded-lg border border-default-200 p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-default-600">Total de filas:</span>
            <span className="font-semibold">{summary.total}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-success-600">
              <CheckCircleIcon className="size-5" />
              Filas válidas:
            </span>
            <span className="font-semibold text-success-600">{summary.valid}</span>
          </div>
          {hasWarningRows && (
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-warning-600">
                <ExclamationTriangleIcon className="size-5" />
                Filas con categorías faltantes:
              </span>
              <span className="font-semibold text-warning-600">{summary.warnings}</span>
            </div>
          )}
          {hasInvalidRows && (
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-danger-600">
                <XCircleIcon className="size-5" />
                Filas inválidas:
              </span>
              <span className="font-semibold text-danger-600">{summary.invalid}</span>
            </div>
          )}
        </div>
      </div>

      {hasWarningRows && categoriesToCreate.length > 0 && (
        <div className="rounded-lg border border-warning-200 bg-warning-50 p-4">
          <div className="mb-4">
            <Checkbox
              isSelected={createMissingCategories}
              onValueChange={onCreateMissingCategoriesChange}
              classNames={{
                label: "text-warning-700",
              }}
            >
              <span className="font-medium">
                Crear {categoriesToCreate.length} categoría(s) faltante(s) automáticamente
              </span>
            </Checkbox>
          </div>
          <div className="ml-7 text-small text-warning-600">
            <p className="mb-2">Se crearán las siguientes categorías:</p>
            <ul className="space-y-1">
              {categoriesToCreate.map((cat, idx) => (
                <li key={idx}>
                  <span className="font-medium">{cat.name}</span>
                  <span className="text-warning-500">
                    {" "}
                    ({CATEGORY_TYPE_LABELS[cat.type] || cat.type})
                  </span>
                  {cat.subcategories.length > 0 && (
                    <span className="text-warning-500">
                      {" "}
                      con subcategorías: {cat.subcategories.join(", ")}
                    </span>
                  )}
                </li>
              ))}
            </ul>
            {!createMissingCategories && (
              <p className="mt-3 text-warning-700">
                Si no creas las categorías, {summary.warnings} fila(s) serán omitidas.
              </p>
            )}
          </div>
        </div>
      )}

      {hasInvalidRows && (
        <div className="rounded-lg border border-danger-200 bg-danger-50 p-4">
          <p className="mb-4 text-small text-danger-700">
            Hay {summary.invalid} fila(s) con errores que no se pueden corregir automáticamente.
            ¿Cómo deseas proceder?
          </p>
          <RadioGroup
            value={skipInvalid ? "skip" : "abort"}
            onValueChange={value => onSkipInvalidChange(value === "skip")}
          >
            <Radio value="skip">
              <div>
                <span className="font-medium">Omitir filas con errores</span>
                <p className="text-small text-default-500">
                  Se omitirán {summary.invalid} filas con errores
                </p>
              </div>
            </Radio>
            <Radio value="abort">
              <div>
                <span className="font-medium">Cancelar importación</span>
                <p className="text-small text-default-500">
                  No se importará nada hasta que se corrijan todos los errores
                </p>
              </div>
            </Radio>
          </RadioGroup>
        </div>
      )}

      {!hasInvalidRows && !hasWarningRows && (
        <div className="rounded-lg border border-success-200 bg-success-50 p-4">
          <p className="text-success-700">
            Todas las filas son válidas. Se importarán {summary.valid} transacciones.
          </p>
        </div>
      )}

      {!hasInvalidRows && hasWarningRows && createMissingCategories && (
        <div className="rounded-lg border border-success-200 bg-success-50 p-4">
          <p className="text-success-700">
            Se importarán {importCount} transacciones y se crearán {categoriesToCreate.length}{" "}
            categoría(s).
          </p>
        </div>
      )}

      <div className="flex justify-between">
        <Button variant="flat" onPress={onBack} isDisabled={isPending}>
          Volver
        </Button>
        <Button
          color="primary"
          onPress={onConfirm}
          isLoading={isPending}
          isDisabled={hasInvalidRows && !skipInvalid}
        >
          {hasInvalidRows && !skipInvalid
            ? "Corregir errores"
            : `Importar ${importCount} transacciones`}
        </Button>
      </div>
    </div>
  );
}
