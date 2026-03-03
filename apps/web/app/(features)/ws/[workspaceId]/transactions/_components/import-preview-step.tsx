"use client";

import { Button, Chip, Pagination } from "@heroui/react";
import {
  CheckCircleIcon,
  ChevronDownIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
} from "@repo/ui/icons";
import { useMemo, useState } from "react";
import type { CategoryToCreate, ImportRow, ImportSummary } from "../_api/import.types";

interface ImportPreviewStepProps {
  rows: ImportRow[];
  summary: ImportSummary;
  categoriesToCreate: CategoryToCreate[];
  onBack: () => void;
  onNext: () => void;
}

const ROWS_PER_PAGE = 10;

const TRANSACTION_TYPE_LABELS: Record<string, string> = {
  income: "Ingreso",
  expense: "Gasto",
  transfer: "Transferencia",
};

const CATEGORY_TYPE_LABELS: Record<string, string> = {
  income: "Ingreso",
  expense: "Gasto",
};

export function ImportPreviewStep({
  rows,
  summary,
  categoriesToCreate,
  onBack,
  onNext,
}: ImportPreviewStepProps) {
  const [page, setPage] = useState(1);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const totalPages = Math.ceil(rows.length / ROWS_PER_PAGE);
  const paginatedRows = useMemo(() => {
    const start = (page - 1) * ROWS_PER_PAGE;
    return rows.slice(start, start + ROWS_PER_PAGE);
  }, [rows, page]);

  const toggleRow = (rowNumber: number) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      if (next.has(rowNumber)) {
        next.delete(rowNumber);
      } else {
        next.add(rowNumber);
      }
      return next;
    });
  };

  const getStatusChip = (status: ImportRow["status"]) => {
    switch (status) {
      case "valid":
        return (
          <Chip color="success" variant="flat" size="sm">
            Válida
          </Chip>
        );
      case "invalid":
        return (
          <Chip color="danger" variant="flat" size="sm">
            Inválida
          </Chip>
        );
      case "warning":
        return (
          <Chip color="warning" variant="flat" size="sm">
            Advertencia
          </Chip>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-lg font-semibold">Vista previa de importación</h2>
        <p className="mt-1 text-small text-default-500">
          Revisa las transacciones antes de importarlas
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-4">
        <div className="flex items-center gap-2 rounded-lg bg-default-100 px-4 py-2">
          <span className="text-small text-default-500">Total:</span>
          <span className="font-semibold">{summary.total}</span>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-success/10 px-4 py-2">
          <CheckCircleIcon className="size-4 text-success" />
          <span className="text-small text-success-600">Válidas:</span>
          <span className="font-semibold text-success-600">{summary.valid}</span>
        </div>
        {summary.invalid > 0 && (
          <div className="flex items-center gap-2 rounded-lg bg-danger/10 px-4 py-2">
            <XCircleIcon className="size-4 text-danger" />
            <span className="text-small text-danger-600">Inválidas:</span>
            <span className="font-semibold text-danger-600">{summary.invalid}</span>
          </div>
        )}
        {summary.warnings > 0 && (
          <div className="flex items-center gap-2 rounded-lg bg-warning/10 px-4 py-2">
            <ExclamationTriangleIcon className="size-4 text-warning" />
            <span className="text-small text-warning-600">Advertencias:</span>
            <span className="font-semibold text-warning-600">{summary.warnings}</span>
          </div>
        )}
      </div>

      {categoriesToCreate.length > 0 && (
        <div className="rounded-lg border border-warning-200 bg-warning-50 p-4">
          <div className="flex items-start gap-3">
            <ExclamationTriangleIcon className="mt-0.5 size-5 shrink-0 text-warning" />
            <div>
              <p className="font-medium text-warning-700">
                Se crearán {categoriesToCreate.length} categoría(s) faltante(s)
              </p>
              <ul className="mt-2 space-y-1 text-small text-warning-600">
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
                        con {cat.subcategories.length} subcategoría(s):{" "}
                        {cat.subcategories.join(", ")}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-default-200">
        <table className="w-full text-small">
          <thead className="bg-default-100">
            <tr>
              <th className="w-10 px-4 py-3 text-left">#</th>
              <th className="px-4 py-3 text-left">Estado</th>
              <th className="px-4 py-3 text-left">Tipo</th>
              <th className="px-4 py-3 text-left">Cuenta</th>
              <th className="px-4 py-3 text-left">Categoría</th>
              <th className="px-4 py-3 text-right">Monto</th>
              <th className="px-4 py-3 text-left">Fecha</th>
              <th className="w-10 px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-default-200">
            {paginatedRows.map(row => (
              <>
                <tr
                  key={row.rowNumber}
                  className={`${
                    row.status === "invalid"
                      ? "bg-danger/5"
                      : row.status === "warning"
                        ? "bg-warning/5"
                        : ""
                  }`}
                >
                  <td className="px-4 py-3">{row.rowNumber}</td>
                  <td className="px-4 py-3">{getStatusChip(row.status)}</td>
                  <td className="px-4 py-3">
                    {TRANSACTION_TYPE_LABELS[row.data.type] || row.data.type}
                  </td>
                  <td className="px-4 py-3">
                    {row.data.accountName}
                    {row.data.toAccountName && (
                      <span className="text-default-400">
                        {" → "}
                        {row.data.toAccountName}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {row.data.categoryName || "-"}
                    {row.data.subcategoryName && (
                      <span className="text-default-400">
                        {" / "}
                        {row.data.subcategoryName}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {new Intl.NumberFormat("es-CL", {
                      style: "currency",
                      currency: row.data.currency || "USD",
                    }).format(row.data.amount)}
                  </td>
                  <td className="px-4 py-3">{row.data.date}</td>
                  <td className="px-4 py-3">
                    {row.errors.length > 0 && (
                      <button
                        onClick={() => toggleRow(row.rowNumber)}
                        className="rounded p-1 hover:bg-default-200"
                      >
                        <ChevronDownIcon
                          className={`size-4 transition-transform ${
                            expandedRows.has(row.rowNumber) ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                    )}
                  </td>
                </tr>
                {expandedRows.has(row.rowNumber) && row.errors.length > 0 && (
                  <tr key={`${row.rowNumber}-errors`} className="bg-danger/5">
                    <td colSpan={8} className="px-4 py-3">
                      <ul className="ml-6 list-disc space-y-1 text-danger-600">
                        {row.errors.map((error, idx) => (
                          <li key={idx}>{error.message}</li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination total={totalPages} page={page} onChange={setPage} showControls />
        </div>
      )}

      <div className="flex justify-between">
        <Button variant="flat" onPress={onBack}>
          Volver
        </Button>
        <Button color="primary" onPress={onNext} isDisabled={summary.valid === 0}>
          Continuar
        </Button>
      </div>
    </div>
  );
}
