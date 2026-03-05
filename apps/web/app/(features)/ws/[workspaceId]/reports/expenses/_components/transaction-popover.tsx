"use client";

import { Skeleton } from "@heroui/react";
import Link from "next/link";
import { useGetTransactionList } from "../../../transactions/_api/get-transaction-list/use-get-transaction-list";

interface TransactionPopoverProps {
  categoryId: string;
  categoryName: string;
  subcategoryId: string | null;
  subcategoryName: string | null;
  month: number;
  year: number;
  amount: number;
  workspaceId: string;
}

function formatFullCurrency(amount: number): string {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("es-CL", { day: "2-digit", month: "2-digit" });
}

function getMonthName(month: number): string {
  return new Date(2000, month - 1, 1).toLocaleDateString("es-CL", { month: "long" });
}

function TransactionListSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex justify-between">
          <Skeleton className="h-4 w-2/3 rounded" />
          <Skeleton className="h-4 w-16 rounded" />
        </div>
      ))}
    </div>
  );
}

export function TransactionPopover({
  categoryId,
  categoryName,
  subcategoryId,
  subcategoryName,
  month,
  year,
  amount,
  workspaceId,
}: TransactionPopoverProps) {
  // Calculate date range for the month
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59, 999);

  const { data, isLoading, error } = useGetTransactionList({
    workspaceId,
    filters: {
      categoryId,
      subcategoryId: subcategoryId ?? undefined,
      type: "expense",
      startDate,
      endDate,
    },
  });

  const displayName = subcategoryName ?? categoryName;
  const monthName = getMonthName(month);

  // Build URL for "Ver todas" link
  const viewAllParams = new URLSearchParams({
    categoryId,
    type: "expense",
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  });
  if (subcategoryId) {
    viewAllParams.set("subcategoryId", subcategoryId);
  }
  const viewAllUrl = `/ws/${workspaceId}/transactions?${viewAllParams.toString()}`;

  const transactions = data ?? [];
  const displayedTransactions = transactions.slice(0, 10);
  const hasMore = transactions.length > 10;

  return (
    <div className="w-72 space-y-3">
      {/* Header */}
      <div>
        <h4 className="font-semibold capitalize">
          {displayName} - {monthName} {year}
        </h4>
        <p className="text-sm text-default-500">Total: {formatFullCurrency(amount)}</p>
      </div>

      {/* Transaction list */}
      <div className="max-h-60 space-y-1 overflow-y-auto">
        {isLoading ? (
          <TransactionListSkeleton />
        ) : error ? (
          <p className="text-sm text-danger">Error al cargar transacciones</p>
        ) : transactions.length === 0 ? (
          <p className="text-sm text-default-400">No hay transacciones</p>
        ) : (
          displayedTransactions.map(tx => (
            <div key={tx.id} className="flex items-center justify-between py-1 text-sm">
              <div className="flex gap-2">
                <span className="text-default-400">{formatDate(tx.date)}</span>
                <span className="max-w-32 truncate">{tx.notes || "-"}</span>
              </div>
              <span className="font-medium">{formatFullCurrency(tx.amount)}</span>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-default-200 pt-2">
        <span className="text-sm text-default-500">
          {transactions.length} transaccion{transactions.length !== 1 ? "es" : ""}
          {hasMore && ` (mostrando 10)`}
        </span>
        <Link href={viewAllUrl} className="text-sm text-primary hover:underline">
          Ver todas &rarr;
        </Link>
      </div>
    </div>
  );
}
